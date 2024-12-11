import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, updateProfile, updatePassword, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

// Ensure user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("email").value = user.email;
    } else {
        alert("You must be logged in to access the settings.");
        location.href = "login.html";
    }
});

// Save Profile Changes
document.getElementById("save-profile-btn").addEventListener("click", () => {
    const nickname = document.getElementById("nickname").value;

    if (auth.currentUser) {
        updateProfile(auth.currentUser, { displayName: nickname })
            .then(() => {
                alert("Profile updated successfully.");
                const userRef = ref(db, `users/${auth.currentUser.uid}`);
                update(userRef, { nickname });
            })
            .catch((error) => {
                console.error(error);
                alert("Failed to update profile.");
            });
    }
});

// Change Password
document.getElementById("change-password-btn").addEventListener("click", () => {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match.");
        return;
    }

    if (auth.currentUser) {
        updatePassword(auth.currentUser, newPassword)
            .then(() => alert("Password updated successfully."))
            .catch((error) => {
                console.error(error);
                alert("Failed to update password.");
            });
    }
});

// Save Theme
document.getElementById("save-theme-btn").addEventListener("click", () => {
    const theme = document.getElementById("theme").value;
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    update(userRef, { theme }).then(() => alert("Theme saved successfully."));
});

// Delete Account
document.getElementById("delete-account-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        deleteUser(auth.currentUser)
            .then(() => alert("Account deleted successfully."))
            .catch((error) => {
                console.error(error);
                alert("Failed to delete account.");
            });
    }
});