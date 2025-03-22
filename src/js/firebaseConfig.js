// src/js/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCq_oooDqFiZA_iXGkpHU1GtG5GZVWIByQ",
  authDomain: "pulmonarycancerai-database.firebaseapp.com",
  databaseURL: "https://pulmonarycancerai-database-default-rtdb.firebaseio.com",
  projectId: "pulmonarycancerai-database",
  storageBucket: "pulmonarycancerai-database.appspot.com",
  messagingSenderId: "898469480759",
  appId: "1:898469480759:web:db0cb79201a1ab856df2b2",
  measurementId: "G-78LD4JTEN0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure Firebase persists the authentication state across pages
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Authentication state will now persist across page reloads
    console.log("Persistence set successfully.");
  })
  .catch((error) => {
    console.error("Error setting persistence: ", error);
  });

export { auth, db };