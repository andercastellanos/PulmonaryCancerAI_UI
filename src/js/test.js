import { db } from './firebaseConfig.js';  // Import Firestore and Auth
import { collection, doc, setDoc } from 'firebase/firestore';  // Import Firestore methods
import { auth } from './firebaseConfig.js'; // Import auth from your firebaseConfig
import { onAuthStateChanged } from 'firebase/auth';

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If a user is logged in, you can show their data or enable certain UI elements
    console.log("User is signed in:", user);
    // Now you can proceed to add patients or other logic for the logged-in user
    document.getElementById('newPatientBtn').addEventListener('click', () => addNewPatient(user.uid));
  } else {
    // If no user is logged in, show a login prompt or disable certain features
    console.log("No user logged in");
  }
});

// Function to add new patient data
const addNewPatient = async (userId) => {
  const newPatient = {
    id: "678766",  // Example patient ID (can be generated)
    name: "John Doe",
    age: 48,
    gender: "Male",
    lastPrediction: "2025-03-18",
    status: "Malignant"
  };

  try {
    // Reference to the user's "patients" collection in Firestore
    const patientsRef = collection(db, "users", userId, "patients");
    await setDoc(doc(patientsRef, newPatient.id), newPatient);  // Add the new patient to Firestore
    console.log(`Patient ${newPatient.name} added successfully.`);

    // Refresh the page after adding the new patient
    window.location.reload(); // Reload the page to update the data
  } catch (error) {
    console.error("Error adding patient: ", error);
  }
};
