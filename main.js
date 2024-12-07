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
  appId: "1:755408416828:web:59f72561f27fb9ffa01339"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Function to register a new user
function registerUser() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const phone = document.getElementById('register-phone').value;

  if (!name || !email || !password || !phone) {
    alert("Please fill in all the fields.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;

      // Save user data to Firebase Database
      set(ref(db, 'users/' + user.uid), {
        name: name,
        email: email,
        phone: phone,
        balance: 500, // Welcome bonus
        lastLogin: new Date().toISOString()
      }).then(() => {
        alert("Registration successful! Welcome bonus of 500 Naira has been added.");
        window.location = 'dashboard.html'; // Redirect to the dashboard
      }).catch(error => {
        console.error("Error saving user data:", error);
        alert("Failed to save user data. Please try again.");
      });
    })
    .catch(error => {
      console.error("Error during registration:", error);
      alert(error.message);
    });
}

// Function to log in a user
function loginUser() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;

      // Update last login time in the database
      update(ref(db, 'users/' + user.uid), {
        lastLogin: new Date().toISOString()
      }).then(() => {
        alert("Login successful!");
        window.location = 'dashboard.html'; // Redirect to the dashboard
      }).catch(error => {
        console.error("Error updating last login:", error);
        alert("Failed to update last login. Please try again.");
      });
    })
    .catch(error => {
      console.error("Error during login:", error);
      alert(error.message);
    });
}

// Expose functions to the global scope
window.registerUser = registerUser;
window.loginUser = loginUser;
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Trigger when a deposit is made
exports.processReferralReward = functions.database.ref('/deposits/{userId}/{depositId}')
  .onCreate(async (snapshot, context) => {
    const depositData = snapshot.val();
    const userId = context.params.userId; // The user who made the deposit
    const depositAmount = depositData.amount; // The amount of the deposit

    try {
      // Get the user's details from the database
      const userSnapshot = await admin.database().ref(`/users/${userId}`).once('value');
      const user = userSnapshot.val();

      if (user && user.referrerId) {
        // Get the referrerId and calculate 10% of the deposit
        const referrerId = user.referrerId;
        const rewardAmount = depositAmount * 0.10; // 10% reward

        // Update the referrer's balance with the 10% reward
        await admin.database().ref(`/users/${referrerId}/balance`).transaction((currentBalance) => {
          return (currentBalance || 0) + rewardAmount; // Add 10% to the referrer's balance
        });

        console.log(`Referrer ${referrerId} has received a reward of ${rewardAmount}`);
      }
    } catch (error) {
      console.error("Error processing referral reward: ", error);
    }
  });