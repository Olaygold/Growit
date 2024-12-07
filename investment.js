import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, update, push, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
const auth = getAuth(app);

// Handle investment
async function handleInvestment(userId, amount, returnAmount, duration) {
  const userRef = ref(db, `users/${userId}`);

  try {
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // Check if balance is sufficient
      if (userData.balance >= amount) {
        // Deduct the investment amount from balance
        const updatedBalance = userData.balance - amount;

        // Record investment
        const investmentsRef = ref(db, `users/${userId}/investments`);
        await push(investmentsRef, {
          investAmount: amount,
          returnAmount: returnAmount,
          duration: duration,
          dailyReturn: returnAmount / duration,
          startDate: new Date().toISOString(),
          status: "Active",
        });

        // Update balance in database
        await update(userRef, { balance: updatedBalance });

        document.getElementById("message").textContent =
          "Investment successful! Your daily returns will be added to your balance.";
        loadInvestmentHistory(userId); // Refresh history
      } else {
        document.getElementById("message").textContent =
          "Insufficient balance to make this investment.";
      }
    } else {
      document.getElementById("message").textContent =
        "Error: User data not found.";
    }
  } catch (error) {
    console.error("Error processing investment:", error);
    document.getElementById("message").textContent =
      "An error occurred. Please try again.";
  }
}

// Load investment history
function loadInvestmentHistory(userId) {
  const investmentsRef = ref(db, `users/${userId}/investments`);
  const historyDiv = document.getElementById("history");

  onValue(investmentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const investments = snapshot.val();
      historyDiv.innerHTML = ""; // Clear previous history

      for (const id in investments) {
        const investment = investments[id];
        const investmentHTML = `
          <div class="history-item">
            <p>Amount Invested: ${investment.investAmount} Naira</p>
            <p>Return Amount: ${investment.returnAmount} Naira</p>
            <p>Duration: ${investment.duration} days</p>
            <p>Status: ${investment.status}</p>
          </div>
        `;
        historyDiv.innerHTML += investmentHTML;
      }
    } else {
      historyDiv.innerHTML = "<p>No investment history found.</p>";
    }
  });
}

// Check authentication state and set up investment buttons
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;

    // Load user's investment history
    loadInvestmentHistory(userId);

    // Add event listeners to investment buttons
    document.querySelectorAll(".plan button").forEach((button) => {
      button.addEventListener("click", () => {
        const amount = parseInt(button.dataset.amount);
        const returnAmount = parseInt(button.dataset.return);
        const duration = parseInt(button.dataset.duration);

        handleInvestment(userId, amount, returnAmount, duration);
      });
    });
  } else {
    alert("Please log in to access this page!");
    window.location.href = "/login.html";
  }
});