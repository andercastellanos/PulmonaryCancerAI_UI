// Retrieve selected patient from localStorage
const patient = JSON.parse(localStorage.getItem('selectedPatient'));

if (patient) {
  // Update patient details in the sidebar
  document.getElementById('dashboardPatientName').textContent = patient.name || 'N/A';
  document.getElementById('dashboardPatientId').textContent = patient.id || 'N/A';
  document.getElementById('dashboardPatientDob').textContent = patient.dob || 'N/A';
  document.getElementById('dashboardPatientGender').textContent = patient.gender || 'N/A';
  document.getElementById('lastVisit').textContent = patient.lastVisit || 'N/A';
  document.getElementById('dashboardMedicalNotes').textContent = patient.notes || 'No medical notes available.';
  document.getElementById('familyHistory').textContent = patient.familyHistory || 'No family history provided.';
  document.getElementById('previousScans').textContent = patient.previousScans || 'No previous scans available.';
} else {
  console.error('No patient data found in localStorage.');
}
