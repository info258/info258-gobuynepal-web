// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

// Auth (v12)
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firestore (v12)
import {
  initializeFirestore,
  connectFirestoreEmulator,
  serverTimestamp,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- Your project (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyC5BOwwDRg46t2LmWp-z8gOXEoyATioSQM",
  authDomain: "customer-login-e5ecd.firebaseapp.com",
  projectId: "customer-login-e5ecd",
  storageBucket: "customer-login-e5ecd.firebasestorage.app",
  messagingSenderId: "569269085839",
  appId: "1:569269085839:web:0192c9f28b8eb24ea2f2fa"
};

// Init
const app  = initializeApp(firebaseConfig);
// Force long-polling on Windows/VPNs
const db   = initializeFirestore(app, { experimentalForceLongPolling: true, useFetchStreams: false });
const auth = getAuth(app);

// --- Emulator wiring (works on localhost/LAN/Android)
const qp       = new URLSearchParams(location.search);
const EMU_HOST = (qp.get("emuHost") || "127.0.0.1").trim();

// If you chose Option A (defaults): use ports 8080/9099
const FS_PORT  = Number(qp.get("fsPort") || 8080);
const AU_PORT  = Number(qp.get("auPort") || 9099);

// Treat localhost or ?emu as “use emulator”
const localish =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)$/.test(location.hostname)
  || qp.has("emu");

if (localish) {
  connectAuthEmulator(auth, `http://${EMU_HOST}:${AU_PORT}`, { disableWarnings: true });
  connectFirestoreEmulator(db, EMU_HOST, FS_PORT);
  console.log("[GoBuy] Emulators:", { EMU_HOST, FS_PORT, AU_PORT });
}

// Optional: ensure signed-in on emulator so rules pass
onAuthStateChanged(auth, async (u) => {
  if (!u) {
    try { await signInAnonymously(auth); } catch { /* ignore */ }
  }
});

// --- Example helpers you can reuse on your pages ---
export { app, db, auth, serverTimestamp, collection, addDoc, onSnapshot, query, orderBy };
