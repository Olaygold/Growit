import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, set, update, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const db = getDatabase();
const auth = getAuth();

// Function to make a withdrawal
function makeWithdrawal() {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to make a withdrawal.");
    return;
  }

  const accountName = document.getElementById("account-name").value;
  const bankName = document.getElementById("bank-name").value;
  const accountNumber = document.getElementById("account-number").value;
  const withdrawalAmount = parseFloat(document.getElementById("withdrawal-amount").value);

  if (!accountName || !bankName || !accountNumber || !withdrawalAmount) {
    alert("Please fill in all fields.");
    return;
  }

  if (withdrawalAmount < 1500) {
    alert("The minimum withdrawal amount is 1500.");
    return;
  }

  const userRef = ref(db, `users/${user.uid}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();

      if (userData.balance < withdrawalAmount) {
        alert("Insufficient balance.");
        return;
      }

      // Subtract balance and create a withdrawal request
      const newBalance = userData.balance - withdrawalAmount;
      update(userRef, { balance: newBalance });

      const withdrawalRequest = {
        accountName,
        bankName,
        accountNumber,
        withdrawalAmount,
        status: "Processing",
        userId: user.uid,
      };

      const withdrawalsRef = ref(db, "withdrawals");
      push(withdrawalsRef, withdrawalRequest)
        .then(() => {
          alert("Withdrawal request submitted. Status: Processing");
        })
        .catch((error) => {
          console.error("Error creating withdrawal request:", error);
          alert("Failed to create withdrawal request.");
        });
    } else {
      alert("User data not found.");
    }
  });
}

window.makeWithdrawal = makeWithdrawal;





// Function to submit a withdrawal request
function submitWithdrawal() {
  const accountName = document.getElementById('account-name').value;
  const bankName = document.getElementById('bank-name').value;
  const accountNumber = document.getElementById('account-number').value;
  const withdrawalAmount = parseFloat(document.getElementById('withdrawal-amount').value);

  const userId = auth.currentUser.uid;  // Get logged-in user's ID
  const userRef = ref(db, 'users/' + userId);

  // Ensure all fields are filled
  if (!accountName || !bankName || !accountNumber || !withdrawalAmount) {
    alert("Please fill in all fields.");
    return;
  }

  // Check if the withdrawal amount is above the minimum threshold
  if (withdrawalAmount < 1500) {
    alert("The minimum withdrawal amount is 1500 Naira.");
    return;
  }

  // Get the user's current balance
  get(userRef).then(snapshot => {
    const user = snapshot.val();
    const currentBalance = user.balance;

    // Check if the user has enough balance
    if (currentBalance >= withdrawalAmount) {
      // Store withdrawal request in Firebase under 'withdrawals'
      const withdrawalId = Date.now(); // Unique ID for the withdrawal request
      const withdrawalRef = ref(db, 'withdrawals/' + withdrawalId);

      set(withdrawalRef, {
        userId: userId,
        accountName: accountName,
        bankName: bankName,
        accountNumber: accountNumber,
        withdrawalAmount: withdrawalAmount,
        status: 'Processing',  // Status when the withdrawal is created
        timestamp: new Date().toISOString()  // Record the time of the request
      }).then(() => {
        alert("Withdrawal request submitted. Status: Processing.");
        updateUserBalance(userId, currentBalance - withdrawalAmount);  // Subtract from user's balance
      }).catch(error => {
        console.error("Error submitting withdrawal:", error);
        alert("Failed to submit withdrawal request.");
      });
    } else {
      alert("Insufficient balance for the withdrawal.");
    }
  });
}

// Function to update the user's balance after a withdrawal
function updateUserBalance(userId, newBalance) {
  const userRef = ref(db, 'users/' + userId);
  update(userRef, {
    balance: newBalance
  }).then(() => {
    console.log("User balance updated.");
  }).catch(error => {
    console.error("Error updating user balance:", error);
  });
}
