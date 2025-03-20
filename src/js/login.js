// src/js/login.js
import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

document.getElementById('login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      alert("Please verify your email before logging in.");
      return;
    }
    
    alert("Login successful!");
    console.log("User logged in:", user);
    
    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    alert(error.message);
  }
});