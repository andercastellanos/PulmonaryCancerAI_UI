import { db } from './firebaseConfig.js';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth } from './firebaseConfig.js';
import { onAuthStateChanged } from 'firebase/auth';

// Variables
let patients = [];  // All patients
let filteredPatients = []; // Patients after search filtering
let currentPage = 1;
const pageSize = 5; // Number of patients per page

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
    fetchPatients(user.uid);
  } else {
    console.log("No user logged in");
  }
});

// Fetch patients from Firestore
const fetchPatients = async (userId) => {
  const patientsRef = collection(db, "users", userId, "patients");
  try {
    const patientSnapshot = await getDocs(patientsRef);
    patients = patientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    filteredPatients = [...patients]; // Start with all patients

    if (patients.length === 0) {
      alert("No patients found.");
      return;
    }

    displayPatients(); // Show first page
    updatePaginationButtons();
  } catch (error) {
    console.error("Error fetching patients:", error);
    alert("An error occurred while fetching patient data.");
  }
};

// Display patients (with search support)
const displayPatients = () => {
  const tableBody = document.querySelector('#patientTable tbody');
  tableBody.innerHTML = '';

  const start = (currentPage - 1) * pageSize;
  const paginatedPatients = filteredPatients.slice(start, start + pageSize);

  paginatedPatients.forEach(patient => {
    const row = document.createElement('tr');
    row.setAttribute('data-id', patient.id);

    row.innerHTML = `
      <td>${patient.id}</td>
      <td>${patient.name}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.lastPrediction || 'N/A'}</td>
      <td>
        <span class="status-${patient.status ? patient.status.toLowerCase() : 'unknown'}">
          <i class="fas ${getStatusIcon(patient.status)}"></i>
          ${patient.status || 'Unknown'}
        </span>
      </td>
      <td>
        <button class="action-btn edit-btn" data-id="${patient.id}">Edit</button>
        <button class="action-btn remove-btn" data-id="${patient.id}">Remove</button>
      </td>
    `;

    row.addEventListener('click', () => selectPatient(patient)); // Click to show details
    tableBody.appendChild(row);
  });

  updatePaginationButtons();

  // Edit patient event listener
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const patientId = e.target.getAttribute('data-id');
      const patient = patients.find(p => p.id === patientId);
      openEditPatientModal(patient);
    });
  });

  // Remove patient event listener
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const patientId = e.target.getAttribute('data-id');
      confirmRemovePatient(patientId);
    });
  });
};

// Get status icon class
const getStatusIcon = (status) => {
  if (status === 'Normal') return 'fa-check-circle'; // Green check icon
  if (status === 'Investigate') return 'fa-exclamation-triangle'; // Yellow exclamation icon
  if (status === 'Malignant') return 'fa-radiation'; // Red radiation icon for Malignant
  return 'fa-question'; // Default icon for 'Unknown' (question mark)
};

// Update pagination buttons
const updatePaginationButtons = () => {
  document.querySelector('.pagination-button:first-child').classList.toggle('disabled', currentPage === 1);
  document.querySelector('.pagination-button:last-child').classList.toggle('disabled', currentPage * pageSize >= filteredPatients.length);
};

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm) ||
    patient.id.toLowerCase().includes(searchTerm) ||
    (patient.status ? patient.status.toLowerCase() : '').includes(searchTerm) ||
    (patient.age ? patient.age.toString().includes(searchTerm) : false) ||
    (patient.gender ? patient.gender.toLowerCase().includes(searchTerm) : false)
  );

  currentPage = 1; // Reset to first page when searching
  displayPatients();
});

// Pagination controls
document.querySelector('.pagination-button:first-child').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPatients();
  }
});

document.querySelector('.pagination-button:last-child').addEventListener('click', () => {
  if (currentPage * pageSize < filteredPatients.length) {
    currentPage++;
    displayPatients();
  }
});

// Select a patient and display details
const selectPatient = (patient) => {
  console.log("Selected patient:", patient);

  localStorage.setItem('selectedPatient', JSON.stringify(patient));

  // Update patient details in the UI
  document.getElementById('selectedPatientName').textContent = patient.name || 'N/A';
  document.getElementById('selectedPatientAge').textContent = patient.age || 'N/A';
  document.getElementById('selectedPatientGender').textContent = patient.gender || 'N/A';
  document.getElementById('selectedPatientDoB').textContent = patient.dob || 'N/A';
  document.getElementById('selectedPatientContact').textContent = patient.contact || 'N/A';

  // Display medical notes if available
  document.getElementById('selectedMedicalNotes').textContent = patient.notes || 'No medical notes available.';
};

// Open Edit Patient Modal
const openEditPatientModal = (patient) => {
  document.getElementById('editPatientName').value = patient.name;
  document.getElementById('editPatientAge').value = patient.age;
  document.getElementById('editPatientGender').value = patient.gender;
  document.getElementById('editPatientDoB').value = patient.dob;
  document.getElementById('editPatientContact').value = patient.contact;
  document.getElementById('editPatientNotes').value = patient.notes || '';
  document.getElementById('editPatientFamilyHistory').value = patient.familyHistory || ''; // Ensure this is being set
  document.getElementById('editPatientPreviousScans').value = patient.previousScans || ''; // Ensure this is being set

  // Show the modal
  document.getElementById('editPatientModal').style.display = 'block';

  // Save button event listener
  document.getElementById('editPatientSubmit').onclick = () => savePatientChanges(patient.id);
};

// Save changes to Firestore
const savePatientChanges = async (patientId) => {
  const name = document.getElementById('editPatientName').value;
  const age = document.getElementById('editPatientAge').value;
  const gender = document.getElementById('editPatientGender').value;
  const dob = document.getElementById('editPatientDoB').value;
  const contact = document.getElementById('editPatientContact').value;
  const notes = document.getElementById('editPatientNotes').value;
  const familyHistory = document.getElementById('editPatientFamilyHistory').value;
  const previousScans = document.getElementById('editPatientPreviousScans').value;

  try {
    const patientRef = doc(db, "users", auth.currentUser.uid, "patients", patientId);
    await updateDoc(patientRef, {
      name,
      age,
      gender,
      dob,
      contact,
      notes,
      familyHistory,
      previousScans
    });
    alert('Patient information updated successfully');
    closeEditPatientModal();
   location.reload(); // Reloads the page to reflect the changes
    fetchPatients(auth.currentUser.uid); // Refresh the patient list
  } catch (error) {
    console.error("Error updating patient:", error);
    alert('Error updating patient information.');
  }
};

const closeEditPatientModal = () => {
  document.getElementById('editPatientModal').style.display = 'none';
};

// Confirm Remove Patient
const confirmRemovePatient = (patientId) => {
  document.getElementById('deleteConfirmationModal').style.display = 'block';
  document.getElementById('confirmDeleteBtn').onclick = () => removePatient(patientId);
};

// Remove patient from Firestore
const removePatient = async (patientId) => {
  try {
    const patientRef = doc(db, "users", auth.currentUser.uid, "patients", patientId);
    await deleteDoc(patientRef);
    alert('Patient removed successfully');
    fetchPatients(auth.currentUser.uid); // Refresh the patient list
    closeDeleteConfirmationModal();
  } catch (error) {
    console.error("Error removing patient:", error);
    alert('Error removing patient.');
  }
};

const closeDeleteConfirmationModal = () => {
  document.getElementById('deleteConfirmationModal').style.display = 'none';
};

// Close modal on clicking the close button
document.getElementById('closeEditPatientModal').onclick = closeEditPatientModal;
document.getElementById('closeDeleteConfirmationModal').onclick = closeDeleteConfirmationModal;

// Close Edit Patient Modal when Cancel button is clicked
document.getElementById('cancelEditPatientBtn').onclick = () => {
  closeEditPatientModal();
};

// Close Remove Patient Modal when Cancel button is clicked
document.getElementById('cancelDeleteBtn').onclick = () => {
  closeDeleteConfirmationModal();
};
