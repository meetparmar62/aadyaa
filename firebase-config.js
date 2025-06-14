// Firebase configuration for v8 SDK (more stable for phone auth)
const firebaseConfig = {
  apiKey: "AIzaSyBzi_HweeamgBRWOzH4Mq7bjLv_g8elZx0",
  authDomain: "aadya-fashions.firebaseapp.com",
  projectId: "aadya-fashions",
  storageBucket: "aadya-fashions.appspot.com",
  messagingSenderId: "721311924078",
  appId: "1:721311924078:web:3e16ea2ba0a07fd6678b7f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth instance
const auth = firebase.auth();

console.log("Firebase v8 initialized successfully");
