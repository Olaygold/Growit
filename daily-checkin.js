import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Configuration
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

// Ensure Auth Persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

// DOM Elements
const checkinBtn = document.getElementById("checkin-btn");
const lastCheckinDisplay = document.getElementById("last-checkin");

// Function to format dates
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Function to handle Daily Check-in
function dailyCheckIn(userId) {
  const userRef = ref(db, `users/${userId}`);
  const now = Date.now();

  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const lastCheckin = userData.lastCheckin || 0;

        if (now - lastCheckin >= 24 * 60 * 60 * 1000) {
          const newBalance = (userData.balance || 0) + 100;

          update(userRef, {
            balance: newBalance,
            lastCheckin: now,
          })
            .then(() => {
              alert("Check-in successful! You earned 100 points.");
              lastCheckinDisplay.textContent = formatDate(now);
            })
            .catch((error) => {
              console.error("Error updating check-in:", error);
              alert("Failed to update check-in. Please try again.");
            });
        } else {
          alert("You can only check in once every 24 hours.");
        }
      } else {
        alert("User data not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Auth State Change Listener
onAuthStateChanged(auth, (user) => {
  console.log("Auth State Changed:", user); // Debug: Log user object
  if (user) {
    const userId = user.uid;
    const userRef = ref(db, `users/${userId}`);

    // Display last check-in time
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const lastCheckin = snapshot.val().lastCheckin || 0;
          lastCheckinDisplay.textContent = lastCheckin
            ? formatDate(lastCheckin)
            : "No check-in yet.";
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    // Add event listener to the check-in button
    checkinBtn.addEventListener("click", () => dailyCheckIn(userId));
  } else {
    alert("Please log in to use the check-in feature.");
    window.location.href = "login.html"; // Redirect to login page
  }
});