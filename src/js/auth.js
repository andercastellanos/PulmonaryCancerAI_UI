// src/js/auth/auth.js
import { auth, db } from '../firebaseConfig.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Track auth state
export const initAuthStateListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Register new user
export const registerUser = async (email, password, userData) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await saveUserData(user.uid, {
      ...userData,
      email: user.email,
      createdAt: new Date()
    });
    
    // Send email verification
    await sendEmailVerification(user);
    
    return {
      success: true,
      user: user,
      message: "User registered successfully. Verification email sent."
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error,
      message: error.message
    };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified
    if (!user.emailVerified) {
      return {
        success: false,
        verified: false,
        message: "Please verify your email before logging in."
      };
    }
    
    return {
      success: true,
      user: user,
      message: "Login successful."
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error,
      message: error.message
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: "Logout successful."
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: error,
      message: error.message
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent."
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: error,
      message: error.message
    };
  }
};

// Save user data to Firestore
const saveUserData = async (userId, userData) => {
  try {
    await setDoc(doc(db, "users", userId), userData);
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data()
      };
    } else {
      return {
        success: false,
        message: "No user data found."
      };
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return {
      success: false,
      error: error,
      message: error.message
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is a doctor (has medical license)
export const isDoctorAccount = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }
  
  try {
    const userData = await getUserData(user.uid);
    return userData.success && userData.data.medicalLicenseNumber;
  } catch (error) {
    console.error("Error checking doctor status:", error);
    return false;
  }
};