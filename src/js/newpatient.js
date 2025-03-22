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
        <span class="status-${patient.status.toLowerCase()}">
          <i class="fas ${getStatusIcon(patient.status)}"></i>
          ${patient.status}
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
  if (status === 'Normal') return 'fa-check-circle';
  if (status === 'Investigate') return 'fa-exclamation-triangle';
  return 'fa-radiation';
};

// Select a patient and display details
const selectPatient = (patient) => {
  document.getElementById('patientName').textContent = patient.name;
  document.getElementById('patientAge').textContent = patient.age;
  document.getElementById('patientGender').textContent = patient.gender;
  document.getElementById('patientDob').textContent = patient.dob || 'N/A';
  document.getElementById('patientContact').textContent = patient.contact || 'N/A';
};

// Search function
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm) ||
    patient.id.toLowerCase().includes(searchTerm) ||
    patient.status.toLowerCase().includes(searchTerm)
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
