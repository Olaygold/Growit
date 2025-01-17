import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

// Extract referral code from URL
const referralCode = new URLSearchParams(window.location.search).get("ref");

// Function to register a new user
async function registerUser() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const phone = document.getElementById("register-phone").value;

  if (!name || !email || !password || !phone) {
    alert("Please fill in all the fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Save user data to Firebase Database
    await set(ref(db, `users/${userId}`), {
      name,
      email,
      phone,
      referredBy: referralCode || null, // Save referral code if provided
      balance: 500, // Welcome bonus
      commission: 0,
      depositProcessed: false,
      lastLogin: new Date().toISOString(),
    });

    alert("Registration successful! Welcome bonus of 500 Naira has been added.");
    window.location.href = "dashboard.html"; // Redirect to the dashboard
  } catch (error) {
    console.error("Error registering user:", error);
    alert(error.message);
  }
}

// Function to log in a user
async function loginUser() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Update last login time in the database
    await update(ref(db, `users/${userId}`), {
      lastLogin: new Date().toISOString(),
    });

    alert("Login successful!");
    window.location.href = "dashboard.html"; // Redirect to the dashboard
  } catch (error) {
    console.error("Error during login:", error);
    alert(error.message);
  }
}

// Function to process referral rewards
async function processReferralReward(snapshot, context) {
  const depositData = snapshot.val();
  const userId = context.params.userId; // User who made the deposit
  const depositAmount = depositData.amount; // Deposit amount

  try {
    // Fetch user details
    const userSnapshot = await admin.database().ref(`/users/${userId}`).once("value");
    const user = userSnapshot.val();

    if (user && user.referredBy) {
      const referrerId = user.referredBy; // Get the referrer ID
      const rewardAmount = depositAmount * 0.10; // 10% reward

      // Update referrer's balance
      await admin.database().ref(`/users/${referrerId}/balance`).transaction((currentBalance) => {
        return (currentBalance || 0) + rewardAmount;
      });

      console.log(`Referrer ${referrerId} has received a reward of ${rewardAmount}`);
    }
  } catch (error) {
    console.error("Error processing referral reward:", error);
  }
}

// Expose functions to the global scope
window.registerUser = registerUser;
window.loginUser = loginUser;
