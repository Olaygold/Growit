import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, update, push, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
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
const db = getDatabase(app);
const auth = getAuth();

/**
 * Function to handle the withdrawal request.
 */
function makeWithdrawal() {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to make a withdrawal.");
    return;
  }

  // Get the form input values
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

  // Store the withdrawal in the database
  const withdrawalDetails = {
    accountName,
    bankName,
    accountNumber,
    withdrawalAmount,
    status: "Processing", // Default status
    timestamp: new Date().toISOString(),
  };

  // Call the function to process and store the withdrawal
  storeWithdrawal(user.uid, withdrawalDetails);
}

/**
 * Function to store the withdrawal in Firebase Realtime Database.
 * @param {string} uid - The user's unique ID.
 * @param {object} withdrawalDetails - The withdrawal details to be stored.
 */
function storeWithdrawal(uid, withdrawalDetails) {
  const userRef = ref(db, `users/${uid}`);

  // Fetch the user details
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Check if the user has enough balance
        if (userData.balance < withdrawalDetails.withdrawalAmount) {
          alert("Insufficient balance.");
          return;
        }

        // Subtract the withdrawal amount from the user's balance
        const newBalance = userData.balance - withdrawalDetails.withdrawalAmount;
        update(userRef, { balance: newBalance });

        // Add the withdrawal details to the withdrawal history
        const withdrawalsRef = ref(db, `users/${uid}/withdrawals`);
        const newWithdrawalRef = push(withdrawalsRef);

        // Store the withdrawal under the user's node
        set(newWithdrawalRef, {
          ...withdrawalDetails,
          email: userData.email || "No Email Provided",
          fullName: userData.fullName || "No Name Provided",
        })
          .then(() => {
            console.log("Withdrawal request stored successfully.");
            alert("Your withdrawal request has been submitted. Status: Processing");
          })
          .catch((error) => {
            console.error("Error storing withdrawal request:", error);
            alert("An error occurred while submitting your withdrawal request.");
          });
      } else {
        alert("User not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
      alert("Failed to retrieve user details.");
    });
}

// Make sure to call the makeWithdrawal function on form submission
document.getElementById("withdrawal-form").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from refreshing the page
  makeWithdrawal();
});