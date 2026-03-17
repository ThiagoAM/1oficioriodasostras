import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPWB-hKklGS9bCG3Fp9qXSQo58w5jdGcE",
  authDomain: "cartorioderiodasostras.firebaseapp.com",
  projectId: "cartorioderiodasostras",
  storageBucket: "cartorioderiodasostras.firebasestorage.app",
  messagingSenderId: "907094147848",
  appId: "1:907094147848:web:2e6359ea618c18e5e6a2bd",
  measurementId: "G-58J8BVJ29N",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const analyticsPromise = (async () => {
  try {
    if (!(await isAnalyticsSupported())) {
      return null;
    }
    return getAnalytics(app);
  } catch (error) {
    return null;
  }
})();

window.FirebaseSiteApp = {
  app,
  db,
  analyticsPromise,
  firebaseConfig,
};

export { app, analyticsPromise, db, firebaseConfig };
