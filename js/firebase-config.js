// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBghCG16b_ztjmpQ0ZsR6zH0a488rs_Sws",
  authDomain: "dut-res-league.firebaseapp.com",
  projectId: "dut-res-league",
  storageBucket: "dut-res-league.appspot.com",
  messagingSenderId: "630362185886",
  appId: "1:630362185886:web:2bbfe05aa7764fd1945b8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
