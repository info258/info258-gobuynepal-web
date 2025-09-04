import { auth, db, storage } from "./firebase-init.js";
import {
  doc, collection, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  serverTimestamp, increment, runTransaction, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { ref as sRef, uploadBytes, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// Users & profile
export async function ensureUserDoc(uid, displayName = "", phoneNumber = "") {
  await setDoc(doc(db, "users", uid), {
    displayName, phoneNumber: phoneNumber || null,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  }, { merge: true });
}
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  const base = snap.exists() ? snap.data() : {};
  return { displayName: base.displayName || "", phoneNumber: base.phoneNumber || "", kyc: base.kyc || null };
}
export async function saveUserProfile(uid, p) {
  await setDoc(doc(db, "users", uid), {
    displayName: p.fullName || null,
    kyc: {
      fullName: p.fullName,
      dateOfBirth: p.dateOfBirth, nationality: p.nationality,
      idType: p.idType, idNumber: p.idNumber, idExpiryDate: p.idExpiryDate || null,
      streetAddress: p.streetAddress, city: p.city, postalCode: p.postalCode || "",
      country: p.country, notes: p.notes || "", updatedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  }, { merge: true });
}
// KYC images
export async function uploadKycImage(uid, side, blobOrFile) {
  const path = `users/${uid}/kyc/${side}.jpg`;
  const r = sRef(storage, path);
  await uploadBytes(r, blobOrFile, { contentType: "image/jpeg" });
  const url = await getDownloadURL(r);
  await updateDoc(doc(db, "users", uid), { [`kyc.${side}Url`]: url, updatedAt: serverTimestamp() });
  return url;
}
export async function deleteKycImage(uid, side) {
  const path = `users/${uid}/kyc/${side}.jpg`;
  try { await deleteObject(sRef(storage, path)); } catch {}
  await updateDoc(doc(db, "users", uid), { [`kyc.${side}Url`]: null, updatedAt: serverTimestamp() });
}

// Products
export async function createProduct(p) {
  const ref = await addDoc(collection(db, "products"), {
    name: p.name, description: p.description || "", price: Number(p.price),
    category: p.category || "", imageUrl: p.imageUrl || "", stockQuantity: Number(p.stockQuantity ?? 0),
    createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  return ref.id;
}
export async function updateProduct(productId, patch) {
  await updateDoc(doc(db, "products", productId), { ...patch, updatedAt: serverTimestamp() });
}
export async function getProduct(productId) {
  const s = await getDoc(doc(db, "products", productId));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}
export async function listProducts({ category, limitTo = 24 } = {}) {
  const base = collection(db, "products");
  const q = category
    ? query(base, where("category", "==", category), orderBy("createdAt", "desc"), limit(limitTo))
    : query(base, orderBy("createdAt", "desc"), limit(limitTo));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Cart (per user)
export async function getCartItems(uid) {
  const snaps = await getDocs(collection(db, "users", uid, "cart", "items"));
  return snaps.docs.map(d => ({ productId: d.id, ...d.data() }));
}
export async function addToCart(uid, product, qty = 1) {
  await setDoc(doc(db, "users", uid, "cart", "items", product.id), {
    quantity: increment(qty),
    productName: product.name, price: Number(product.price), imageUrl: product.imageUrl || ""
  }, { merge: true });
}
export async function setCartItem(uid, product, qty) {
  if (qty <= 0) return deleteDoc(doc(db, "users", uid, "cart", "items", product.id));
  await setDoc(doc(db, "users", uid, "cart", "items", product.id), {
    quantity: Number(qty),
    productName: product.name, price: Number(product.price), imageUrl: product.imageUrl || ""
  }, { merge: true });
}
export async function removeFromCart(uid, productId) {
  await deleteDoc(doc(db, "users", uid, "cart", "items", productId));
}
export async function clearCart(uid) {
  const snaps = await getDocs(collection(db, "users", uid, "cart", "items"));
  await Promise.all(snaps.docs.map(d => deleteDoc(d.ref)));
}

// Orders (transactional stock decrement)
export async function createOrderFromCart(uid, { deliveryAddress, notes = "" }) {
  const itemsSnap = await getDocs(collection(db, "users", uid, "cart", "items"));
  const items = itemsSnap.docs.map(d => ({ productId: d.id, ...d.data() }));
  if (!items.length) throw new Error("Cart is empty.");

  return await runTransaction(db, async (tx) => {
    // Check stock & total
    let total = 0;
    const productRefs = items.map(it => doc(db, "products", it.productId));
    const productSnaps = await Promise.all(productRefs.map(ref => tx.get(ref)));

    productSnaps.forEach((snap, i) => {
      if (!snap.exists()) throw new Error("Product not found.");
      const data = snap.data();
      const qty = Number(items[i].quantity || 0);
      if (data.stockQuantity < qty) throw new Error(`Not enough stock for ${data.name}.`);
      total += (items[i].price ?? data.price) * qty;
    });

    // Order head
    const orderRef = await addDoc(collection(db, "users", uid, "orders"), {
      orderDate: serverTimestamp(),
      totalAmount: Number(total.toFixed(2)),
      status: "pending",
      deliveryAddress, notes,
      updatedAt: serverTimestamp()
    });

    // Items & stock decrement
    await Promise.all(items.map(async (it, i) => {
      const pdata = productSnaps[i].data();
      await addDoc(collection(db, "users", uid, "orders", orderRef.id, "items"), {
        productId: productRefs[i].id,
        productName: it.productName ?? pdata.name,
        priceAtOrder: Number((it.price ?? pdata.price).toFixed(2)),
        quantity: Number(it.quantity)
      });
      tx.update(productRefs[i], { stockQuantity: increment(-Number(it.quantity)), updatedAt: serverTimestamp() });
    }));

    // Clear cart
    itemsSnap.forEach(d => tx.delete(d.ref));
    return orderRef.id;
  });
}
export async function listOrders(uid, { limitTo = 20 } = {}) {
  const snaps = await getDocs(query(collection(db, "users", uid, "orders"), orderBy("orderDate", "desc"), limit(limitTo)));
  return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
}
