// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzi_HweeamgBRWOzH4Mq7bjLv_g8elZx0",
  authDomain: "aadya-fashions.firebaseapp.com",
  projectId: "aadya-fashions",
  storageBucket: "aadya-fashions.firebasestorage.app",
  messagingSenderId: "721311924078",
  appId: "1:721311924078:web:3e16ea2ba0a07fd6678b7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export for use in other files
window.firebaseAuth = auth;
window.RecaptchaVerifier = RecaptchaVerifier;
window.signInWithPhoneNumber = signInWithPhoneNumber;
