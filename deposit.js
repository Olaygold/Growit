import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, update, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Configuration
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

let currentUser = null;

// Authenticate user and fetch balance
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    fetchBalance();
  } else {
    window.location = "login.html"; // Redirect if not logged in
  }
});

// Fetch user balance
function fetchBalance() {
  const userRef = ref(db, `users/${currentUser.uid}`);
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        document.getElementById("current-balance").innerText = userData.balance || 0;
      } else {
        console.error("User data not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching balance:", error);
    });
}

// Handle Deposit Submission
document.getElementById("deposit-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const amount = parseInt(document.getElementById("amount").value);
  if (amount < 100) {
    alert("Minimum deposit is 100 Naira.");
    return;
  }

  // Start Paystack Payment
  const handler = PaystackPop.setup({
    key: "pk_live_655c8bcc32899ee6c6ff3acf23036499935e69ec", // Paystack Public Key
    email: currentUser.email,
    amount: amount * 100, // Convert to Kobo
    currency: "NGN",
    callback: function (response) {
      // Payment Success Callback
      updateBalance(amount);
    },
    onClose: function () {
      alert("Payment was not completed.");
    }
  });

  handler.openIframe();
});

// Update Firebase Balance and Save Deposit Information
function updateBalance(amount) {
  const userRef = ref(db, `users/${currentUser.uid}`);
  const depositsRef = ref(db, `deposits/${currentUser.uid}`);
  const depositId = new Date().getTime(); // Unique deposit ID (timestamp)

  // Fetch user data
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const newBalance = (userData.balance || 0) + amount;

        // Update user balance
        update(userRef, { balance: newBalance })
          .then(() => {
            // Save deposit details to the "deposits" node
            const depositData = {
              amount: amount,
              timestamp: new Date().toISOString(),
              status: "successful", // Mark as successful
              userEmail: currentUser.email,
            };

            update(ref(db, `deposits/${currentUser.uid}/${depositId}`), depositData)
              .then(() => {
                alert(`Deposit of ${amount} Naira successful!`);
                fetchBalance(); // Refresh balance
              })
              .catch((error) => {
                console.error("Error saving deposit information:", error);
              });
          })
          .catch((error) => {
            console.error("Error updating balance:", error);
          });
      } else {
        console.error("User data not found");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}