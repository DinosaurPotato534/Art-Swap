const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getAuth } = require('firebase/auth');
const cors = require('cors');
const express = require('express');

const firebaseConfig = {
  apiKey: "AIzaSyAgJ5CKTTqBP-BoYF-4eEdvq251xWEKQyk",
  authDomain: "listen-together-6969.firebaseapp.com",
  projectId: "listen-together-6969",
  storageBucket: "listen-together-6969.firebasestorage.app",
  messagingSenderId: "224351684851",
  appId: "1:224351684851:web:ba32b5f3668d730babcf86",
  measurementId: "G-5ZNBQDWV1T"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

const expressApp = express();
expressApp.use(cors({ origin: true }));

console.log("Firebase initialized with CORS configuration");
