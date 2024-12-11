import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAELWzVQZiw2PxbNUT3-YK4a6KPHfYkdZ4",
  authDomain: "work-98965.firebaseapp.com",
  databaseURL: "https://work-98965-default-rtdb.firebaseio.com",
  projectId: "work-98965",
  storageBucket: "work-98965.appspot.com",
  messagingSenderId: "755408416828",
  appId: "1:755408416828:web:59f72561f27fb9ffa01339"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Ensure the user is logged in before accessing the page
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    fetchUserWithdrawalHistory(); // Fetch the withdrawal history when the user is logged in
  } else {
    alert("You must be logged in to access this page.");
    window.location = 'login.html'; // Redirect to login if the user is not logged in
  }
});

// Function to record a withdrawal
function recordWithdrawal(amount, status) {
  if (!currentUser) {
    console.error("No user is logged in.");
    return;
  }

  const withdrawalRef = ref(db, `users/${currentUser.uid}/withdrawals`);

  const newWithdrawal = {
    withdrawalAmount: amount,
    status: status, // e.g., 'Pending', 'Paid', 'Failed'
    timestamp: Date.now() // Store timestamp
  };

  push(withdrawalRef, newWithdrawal)
    .then(() => {
      console.log("Withdrawal recorded successfully.");
      fetchUserWithdrawalHistory(); // Refresh the history table
    })
    .catch((error) => {
      console.error("Error recording withdrawal:", error);
    });
}

// Function to fetch withdrawal history for the current user
function fetchUserWithdrawalHistory() {
  if (!currentUser) {
    console.error("No user is logged in.");
    return;
  }

  const withdrawalRef = ref(db, `users/${currentUser.uid}/withdrawals`);

  get(withdrawalRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const withdrawals = snapshot.val();
        populateWithdrawalHistoryTable(withdrawals);
      } else {
        alert("No withdrawal history found for your account.");
        populateWithdrawalHistoryTable({}); // Clear table if no history
      }
    })
    .catch((error) => {
      console.error("Error fetching withdrawal history:", error);
      alert("Failed to fetch withdrawal history. Please check the console for more details.");
    });
}

// Function to populate the withdrawal history table
function populateWithdrawalHistoryTable(withdrawals) {
  const tableBody = document.getElementById('withdrawal-history-body');

  if (!tableBody) {
    console.error("Table body element not found!");
    return;
  }

  tableBody.innerHTML = ''; // Clear existing rows

  // Check if there are withdrawals to display
  if (Object.keys(withdrawals).length === 0) {
    const noDataRow = document.createElement('tr');
    noDataRow.innerHTML = `<td colspan="3" style="text-align: center;">No withdrawal history available.</td>`;
    tableBody.appendChild(noDataRow);
    return;
  }

  // Populate the table with the user's withdrawal history
  for (const id in withdrawals) {
    const withdrawal = withdrawals[id];
    const row = document.createElement('tr');

    // Highlight "Paid" and "Failed" statuses differently
    const statusClass = withdrawal.status === 'Paid' ? 'status-paid' : withdrawal.status === 'Failed' ? 'status-failed' : '';

    row.innerHTML = `
      <td>${withdrawal.withdrawalAmount} Naira</td>
      <td class="${statusClass}">${withdrawal.status}</td>
      <td>${new Date(withdrawal.timestamp).toLocaleString()}</td>
    `;

    tableBody.appendChild(row);
  }
}

// Example usage: Record a withdrawal
document.getElementById('withdraw-button').addEventListener('click', () => {
  const amount = document.getElementById('withdraw-amount').value;
  const status = 'Pending'; // Initial status of the withdrawal
  recordWithdrawal(amount, status);
});