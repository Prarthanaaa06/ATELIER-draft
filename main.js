
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCKGGr0QWdXtBCeXVgv4I9eJx_3LHYdJQM",
    authDomain: "atelier-f37d1.firebaseapp.com",
    projectId: "atelier-f37d1",
    storageBucket: "atelier-f37d1.firebasestorage.app",
    messagingSenderId: "764876544642",
    appId: "1:764876544642:web:618b2e9f2b83e0e028329b",
    measurementId: "G-PMTZ9R8WLJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
