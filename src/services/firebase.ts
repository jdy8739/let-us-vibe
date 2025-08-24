// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics as getAnalyticsFirebase } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZWxEimXVYh13zr3wx00lqO6BNT13S-1o",
  authDomain: "aidaily-41d9a.firebaseapp.com",
  projectId: "aidaily-41d9a",
  storageBucket: "aidaily-41d9a.firebasestorage.app",
  messagingSenderId: "294109074685",
  appId: "1:294109074685:web:9a8ee7e15b78db0a355a94",
  measurementId: "G-FVNV2DTPCX",
} as const;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const getAnalytics = (app: FirebaseApp) => getAnalyticsFirebase(app);

export default app;
export { auth, getAnalytics };
