import { db } from './firebaseConfig.js';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';

// Get modal elements
const newPatientModal = document.getElementById("newPatientModal");
const newPatientBtn = document.getElementById("newPatientBtn");
const closeNewPatientModal = document.getElementById("closeNewPatientModal");
const cancelNewPatientBtn = document.getElementById("cancelNewPatientBtn");
const savePatientBtn = document.getElementById("savePatientBtn");

// Function to clear the form fields
const clearForm = () => {
    document.getElementById("patientName").value = "";
    document.getElementById("patientAge").value = "";
    document.getElementById("patientGender").value = "Male";  // Default value for gender
    document.getElementById("patientDOB").value = "";
    document.getElementById("patientContact").value = "";
    document.getElementById("patientNotes").value = "";
    document.getElementById("patientFamilyHistory").value = "";
    document.getElementById("patientPreviousScans").value = "";
};

// Open modal
newPatientBtn.addEventListener("click", () => {
    newPatientModal.style.display = "block";
    clearForm(); // Clear the form when opening the modal
});

// Close modal
closeNewPatientModal.addEventListener("click", () => {
    newPatientModal.style.display = "none";
    clearForm(); // Clear the form when closing the modal
});

cancelNewPatientBtn.addEventListener("click", () => {
    newPatientModal.style.display = "none";
    clearForm(); // Clear the form when canceling
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === newPatientModal) {
        newPatientModal.style.display = "none";
        clearForm(); // Clear the form when clicking outside the modal
    }
});

// Date of Birth validation (Year must be 4 digits)
document.getElementById("patientDOB").addEventListener("blur", function () {
    let dobInput = this.value;
    let dobError = document.getElementById("dobError");

    if (dobInput) {
        let [year, month, day] = dobInput.split("-").map(num => parseInt(num, 10));

        // Ensure the year is 4 digits
        const isValidYear = year >= 1000 && year <= 9999;

        const isValidMonth = month >= 1 && month <= 12;
        const isValidDay = day >= 1 && day <= 31;

        if (!isValidYear || !isValidMonth || !isValidDay) {
            dobError.style.display = "inline";
            this.value = ""; // Clear invalid input
        } else {
            dobError.style.display = "none";
        }
    }
});

// Handle form submission
savePatientBtn.addEventListener("click", async () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No user logged in");
            return;
        }

        const userId = user.uid;
        const patientsRef = collection(db, "users", userId, "patients");
        const counterDocRef = doc(db, "users", userId, "counters", "patientIdCounter");

        try {
            // Fetch the current counter value (highest patient ID)
            const counterDoc = await getDoc(counterDocRef);

            let newPatientId;
            if (counterDoc.exists()) {
                // Increment the counter by 1
                newPatientId = counterDoc.data().value + 1;
                // Update the counter document with the new value
                await updateDoc(counterDocRef, { value: newPatientId });
            } else {
                // If counter does not exist, initialize it with 1
                newPatientId = 1;
                await setDoc(counterDocRef, { value: newPatientId });
            }

            // Collect the form data
            const patientData = {
                id: newPatientId.toString(), // Use the incremented ID as a string
                name: document.getElementById("patientName").value,
                age: document.getElementById("patientAge").value,
                gender: document.getElementById("patientGender").value,
                dob: document.getElementById("patientDOB").value,
                contact: document.getElementById("patientContact").value,
                notes: document.getElementById("patientNotes").value,
                familyHistory: document.getElementById("patientFamilyHistory").value,
                previousScans: document.getElementById("patientPreviousScans").value,
                status: "", 
                lastPrediction: "" 
            };

            // Save the patient data with the new ID
            await setDoc(doc(patientsRef, patientData.id), patientData);
            console.log(`Patient ${patientData.name} added successfully with ID ${patientData.id}`);

            // Clear the form after saving
            clearForm();

            // Close the modal after saving
            newPatientModal.style.display = "none";

            // Reload the page after saving
            location.reload(); // This will reload the page to reflect the updated data

        } catch (error) {
            console.error("Error adding patient: ", error);
        }
    });
});
