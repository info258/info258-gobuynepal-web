import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  initializeFirestore, getFirestore,
  persistentLocalCache, persistentSingleTabManager, memoryLocalCache
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5BOwwDRg46t2LmWp-z8gOXEoyATioSQM",
  authDomain: "customer-login-e5ecd.firebaseapp.com",
  projectId: "customer-login-e5ecd",
  storageBucket: "customer-login-e5ecd.appspot.com",
  messagingSenderId: "569269085839",
  appId: "1:569269085839:web:0192c9f28b8eb24ea2f2fa"
};

export const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let _db;
try {
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
  });
} catch {
  try { _db = getFirestore(app); }
  catch { _db = initializeFirestore(app, { localCache: memoryLocalCache() }); }
}
export const db = _db;

export const storage = getStorage(app);
