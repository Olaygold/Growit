import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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
    fetchWithdrawalHistory(); // Fetch the withdrawal history when the user is logged in
  } else {
    window.location = 'login.html'; // Redirect to login if the user is not logged in
  }
});

// Function to fetch withdrawal history for the current user
function fetchWithdrawalHistory() {
  const withdrawalRef = ref(db, 'withdrawals/');

  get(withdrawalRef)
    .then(snapshot => {
      if (snapshot.exists()) {
        const withdrawals = snapshot.val();
        const userWithdrawals = filterUserWithdrawals(withdrawals);  // Filter withdrawals for the current user
        populateWithdrawalHistoryTable(userWithdrawals);
      } else {
        alert("No withdrawal requests found.");
      }
    })
    .catch(error => {
      console.error("Error fetching withdrawal history:", error);
      alert("Failed to fetch withdrawal history. Please check the console.");
    });
}

// Function to filter withdrawal history for the current user
function filterUserWithdrawals(withdrawals) {
  const userWithdrawals = [];
  
  for (const key in withdrawals) {
    if (withdrawals[key].userId === currentUser.uid) {
      userWithdrawals.push({
        withdrawalAmount: withdrawals[key].withdrawalAmount,
        status: withdrawals[key].status,
        timestamp: withdrawals[key].timestamp
      });
    }
  }

  return userWithdrawals;
}

// Function to populate the withdrawal history table
function populateWithdrawalHistoryTable(withdrawals) {
  const tableBody = document.getElementById('withdrawal-history-body');
  if (!tableBody) {
    console.error("Table body element not found!");
    return;
  }

  tableBody.innerHTML = ''; // Clear existing rows

  withdrawals.forEach(withdrawal => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${withdrawal.withdrawalAmount}</td>
      <td>${withdrawal.status}</td>
      <td>${new Date(withdrawal.timestamp).toLocaleString()}</td>
    `;

    tableBody.appendChild(row);
  });
}