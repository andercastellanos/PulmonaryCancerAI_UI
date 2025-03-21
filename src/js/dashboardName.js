import { db } from './firebaseConfig.js';  // Make sure you're importing Firestore from the correct file
import { collection, query, where, getDocs } from 'firebase/firestore';

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
