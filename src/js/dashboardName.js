import { db } from './firebaseConfig.js';  // Make sure you're importing Firestore from the correct file
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from './firebaseConfig.js'; // Import auth from your firebaseConfig
import { onAuthStateChanged } from 'firebase/auth';


document.addEventListener('DOMContentLoaded', async () => {
  // Assuming you've already stored the user's email in local storage or session
  const userEmail = localStorage.getItem('userEmail');  // Or use sessionStorage or other methods

  if (!userEmail) {
    // If no user email is found in localStorage, redirect to login
    window.location.href = "/login.html";
    return;
  }

  try {
    // Query Firestore for the user document matching the email
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', userEmail));
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If we found the document with the matching email
      const userDoc = querySnapshot.docs[0];  // Get the first matching document
      const fullName = userDoc.data().fullName;

      console.log("Full Name fetched from Firestore:", fullName);  // Log the full name

      // Display the full name in the dashboard header
      const userFullNameElement = document.getElementById('userFullName');
      if (userFullNameElement) {
        userFullNameElement.textContent = `Welcome, ${fullName}`;
      }
    } else {
      console.log("No user found with the provided email.");
    }
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user);
    
    // You can access user information here, for example:
    localStorage.setItem('userEmail', user.email);
    
    // Optionally, redirect if the user is already logged in (to avoid being on the login page)
    if (window.location.pathname === '/login.html') {
      window.location.href = 'dashboard.html';
    }
  } else {
    // No user is signed in
    console.log("No user is signed in.");
    
    // Optionally, redirect the user to the login page if they are not logged in
    if (window.location.pathname !== '/login.html') {
      window.location.href = 'login.html';
    }
  }
});