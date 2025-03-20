// src/js/createAccount.js
import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  // Collect form data
  const fullName = document.getElementById('fullName').value;
  const medicalLN = document.getElementById('medicalLN').value;
  const npi = document.getElementById('npi').value || null; // Optional
  const associationName = document.getElementById('associationName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user) {
      throw new Error("User creation failed.");
    }
    
    console.log("User created:", user);
    
    // Save additional user info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      fullName: fullName,
      medicalLicenseNumber: medicalLN,
      npi: npi,
      associationName: associationName,
      email: user.email,
      createdAt: new Date(),
    });
    
    console.log('User data saved to Firestore.');
    
    // Send email verification
    await sendEmailVerification(user);
    console.log('Email verification sent.');
    
    alert('Account created successfully! Please verify your email before logging in.');
    
    // Redirect to login page
    window.location.href = "/";  // Root path for index.html
  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
  }
});