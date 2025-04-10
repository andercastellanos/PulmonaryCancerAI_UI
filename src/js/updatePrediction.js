import { db, auth } from './firebaseConfig.js'; // Make sure auth is properly imported
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is logged in, proceed with updating the patient data
    const patient = JSON.parse(localStorage.getItem('selectedPatient'));

    if (patient) {
      // Get the predicted class from localStorage
      const predictedClass = localStorage.getItem("predictedClass");

      if (predictedClass) {
        try {
          console.log("Predicted Class:", predictedClass);

          // Get the current date and time for the prediction
          const predictionDate = new Date().toLocaleString();
          console.log("Prediction Date:", predictionDate);

          // Get the current value of previousScans and increment it
          const currentPreviousScans = Number(patient.previousScans) || 0;
          const updatedPreviousScans = currentPreviousScans

          // Create a reference to the selected patient's document
          const patientRef = doc(db, "users", user.uid, "patients", patient.id);
          console.log("Patient Reference:", patientRef);

          // Update patient status, lastPrediction, and previousScans field
          await updateDoc(patientRef, {
            status: predictedClass, // Set the predicted class as the status
            lastPrediction: predictionDate, // Set the current date and time as the last prediction time
            previousScans: updatedPreviousScans // Increment and update the previousScans count
          });

          console.log("Patient status, prediction, and previous scans updated successfully.");

          // Update the patient data in localStorage as well (optional)
          patient.previousScans = updatedPreviousScans;
          localStorage.setItem('selectedPatient', JSON.stringify(patient));

          // Clear the predicted class from localStorage after the update
          localStorage.removeItem("predictedClass");

          // Display a success message on the page
          alert("Patient status and scans updated successfully.");
        } catch (error) {
          console.error("Error updating patient status:", error);
          alert("Error updating patient status: " + error.message);
        }
      } else {
        console.log("No predicted class found in localStorage.");
      }
    } else {
      console.log("No selected patient found.");
    }
  } else {
    console.log("No user is logged in.");
    alert("Please log in to update the patient status.");
  }
});
