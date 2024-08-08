import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxWPZqP7_S_cm1Inwzmy4-nbdOm1KIn3Q",
  authDomain: "pantry-tracker-eddbc.firebaseapp.com",
  projectId: "pantry-tracker-eddbc",
  storageBucket: "pantry-tracker-eddbc.appspot.com",
  messagingSenderId: "135261775042",
  appId: "1:135261775042:web:6cb7938eefe80a35cc075b",
  measurementId: "G-8QWLL3PKKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, firestore, googleProvider };
