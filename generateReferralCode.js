import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
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

// Generate a unique referral code
function generateReferralCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Check if a referral code is already assigned to the user
async function checkAndAssignReferralCode(userId) {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // If the user already has a referral code, return it
      if (userData.referralCode) {
        console.log("Referral code already exists:", userData.referralCode);
        document.getElementById("referralCode").textContent = `Your Referral Code: ${userData.referralCode}`;
      } else {
        // Generate and assign a new referral code
        let newReferralCode = generateReferralCode();

        // Ensure the referral code is unique
        const referralRef = ref(db, "referralCodes");
        const referralSnapshot = await get(referralRef);

        if (referralSnapshot.exists()) {
          const allCodes = referralSnapshot.val();
          while (Object.values(allCodes).includes(newReferralCode)) {
            newReferralCode = generateReferralCode(); // Regenerate if duplicate
          }
        }

        // Save the new referral code to the user's data
        await update(userRef, { referralCode: newReferralCode });

        // Save the referral code globally to ensure uniqueness
        const referralCodeRef = ref(db, `referralCodes/${newReferralCode}`);
        await set(referralCodeRef, userId);

        console.log("New referral code assigned:", newReferralCode);
        document.getElementById("referralCode").textContent = `Your Referral Code: ${newReferralCode}`;
      }
    } else {
      console.error("User data not found.");
    }
  } catch (error) {
    console.error("Error generating referral code:", error);
  }
}

// Check authentication state and generate referral code
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    checkAndAssignReferralCode(user.uid);
  } else {
    alert("Please log in to access this page!");
    window.location.href = "/login.html";
  }
});