import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'firebase/firestore';
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
    `;

    row.addEventListener('click', () => selectPatient(patient)); // Click to show details
    tableBody.appendChild(row);
  });

  updatePaginationButtons();
};

// Get status icon class
const getStatusIcon = (status) => {
  if (status === 'Normal') return 'fa-check-circle'; // Green check icon
  if (status === 'Investigate') return 'fa-exclamation-triangle'; // Yellow exclamation icon
  if (status === 'Malignant') return 'fa-radiation'; // Red radiation icon for Malignant
  return 'fa-question'; // Default icon for 'Unknown' (question mark)
};

// Get status color (for styling)
const getStatusColor = (status) => {
  if (status === 'Normal') return 'green'; // Green color for Normal
  if (status === 'Investigate') return 'orange'; // Orange color for Investigate
  if (status === 'Malignant') return 'red'; // Red color for Malignant
  return 'gray'; // Gray color for Unknown
};

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

// Update pagination buttons
const updatePaginationButtons = () => {
  document.querySelector('.pagination-button:first-child').classList.toggle('disabled', currentPage === 1);
  document.querySelector('.pagination-button:last-child').classList.toggle('disabled', currentPage * pageSize >= filteredPatients.length);
};
