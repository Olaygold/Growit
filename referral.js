import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
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

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
  } else {
    alert("You need to log in first!");
    window.location.href = "/login.html";
  }
});

document.getElementById("referralForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const referralCode = document.getElementById("referralCode").value.trim();

  if (!referralCode) {
    alert("Please enter a referral code!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in!");
    return;
  }

  const userId = user.uid;

  try {
    // Check if the referral code exists in the database
    const usersRef = ref(db, "users");
    const usersSnapshot = await get(usersRef);

    if (usersSnapshot.exists()) {
      const users = usersSnapshot.val();
      const referrerId = Object.keys(users).find(
        (id) => users[id].referralCode === referralCode
      );

      if (!referrerId) {
        alert("Invalid referral code!");
        return;
      }

      // Check if the user already has a referral code
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();

        if (userData.referredBy) {
          alert("You have already added a referral code!");
          return;
        }

        // Save the referral code to the user's data
        await update(userRef, {
          referredBy: referralCode
        });

        alert("Referral code added successfully!");
      } else {
        alert("User data not found!");
      }
    } else {
      alert("No users found in the database!");
    }
  } catch (error) {
    console.error("Error adding referral code:", error);
    alert("An error occurred. Please try again.");
  }
});