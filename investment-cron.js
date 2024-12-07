import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, get, update, push } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAELWzVQZiw2PxbNUT3-YK4a6KPHfYkdZ4",
  authDomain: "work-98965.firebaseapp.com",
  databaseURL: "https://work-98965-default-rtdb.firebaseio.com",
  projectId: "work-98965",
  storageBucket: "work-98965.appspot.com",
  messagingSenderId: "755408416828",
  appId: "1:755408416828:web:59f72561f27fb9ffa01339",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Track the current user
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadInvestmentHistory();
  } else {
    alert("You must be logged in to view this page.");
    window.location = "/login.html";
  }
});

// Function to invest
function invest(amount, profit) {
  if (!currentUser) {
    alert("Please log in to make an investment.");
    return;
  }

  // Fetch user's current balance
  const userRef = ref(db, `users/${currentUser.uid}`);
  get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const currentBalance = userData.balance || 0;

      // Check if user has enough balance
      if (currentBalance >= amount) {
        const investmentId = push(ref(db, `investments/${currentUser.uid}`)).key;

        // Deduct amount and create investment record
        update(userRef, { balance: currentBalance - amount }).then(() => {
          const investmentRef = ref(db, `investments/${currentUser.uid}/${investmentId}`);
          set(investmentRef, {
            amount,
            profit,
            status: "Processing",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          }).then(() => {
            alert("Investment successfully created!");
            loadInvestmentHistory();
          });
        });
      } else {
        alert("Insufficient balance to make this investment.");
      }
    } else {
      alert("User data not found.");
    }
  }).catch((error) => {
    console.error("Error fetching user data:", error);
    alert("Failed to fetch user data.");
  });
}

// Function to load investment history
function loadInvestmentHistory() {
  const historyBody = document.getElementById("history-body");
  const investmentsRef = ref(db, `investments/${currentUser.uid}`);

  get(investmentsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const investments = snapshot.val();
      historyBody.innerHTML = "";

      for (const key in investments) {
        const investment = investments[key];
        const status = new Date(investment.endDate) <= new Date() ? "Completed" : investment.status;

        // Update balance if the investment is completed
        if (status === "Completed" && investment.status !== "Completed") {
          update(ref(db, `investments/${currentUser.uid}/${key}`), { status: "Completed" });
          update(ref(db, `users/${currentUser.uid}`), {
            balance: (investment.profit || 0) + (investment.amount || 0),
          });
        }

        // Populate the table
        const row = `
          <tr>
            <td>${investment.amount} → ${investment.profit}</td>
            <td>₦${investment.amount}</td>
            <td>₦${investment.profit}</td>
            <td>${status}</td>
          </tr>`;
        historyBody.innerHTML += row;
      }
    } else {
      historyBody.innerHTML = `<tr><td colspan="4">No investments found.</td></tr>`;
    }
  }).catch((error) => {
    console.error("Error loading investment history:", error);
    alert("Failed to load investment history.");
  });
}

export { invest };