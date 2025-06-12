// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzi_HweeamgBRWOzH4Mq7bjLv_g8elZx0",
  authDomain: "aadya-fashions.firebaseapp.com",
  projectId: "aadya-fashions",
  storageBucket: "aadya-fashions.appspot.com", // Corrected storageBucket format
  messagingSenderId: "721311924078",
  appId: "1:721311924078:web:3e16ea2ba0a07fd6678b7f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
