// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvYRbRdLGBfKQbBKVz2Pq-iuOonLtHaAE",
    authDomain: "harsha-arts-website.firebaseapp.com",
    projectId: "harsha-arts-website",
    storageBucket: "harsha-arts-website.firebasestorage.app",
    messagingSenderId: "698520096905",
    appId: "1:698520096905:web:08e2373a41c6c8dd0cb658",
    measurementId: "G-HYMSSL5DS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
