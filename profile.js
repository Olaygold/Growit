import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

// Ensure the user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Display user name and email
        document.getElementById('user-name').textContent = user.displayName || "User";
        document.getElementById('user-email').textContent = user.email;

        // Handle logout
        document.getElementById('logout-button').addEventListener('click', () => {
            signOut(auth).then(() => {
                alert("Logged out successfully.");
                window.location = 'login.html'; // Redirect to login page
            }).catch(error => {
                console.error("Error logging out:", error);
            });
        });

        // Show the change password section
        document.getElementById('change-password-button').addEventListener('click', () => {
            document.getElementById('password-change-section').style.display = 'block';
        });

        // Handle password change form
        document.getElementById('change-password-form').addEventListener('submit', (event) => {
            event.preventDefault();

            const oldPassword = document.getElementById('old-password').value;
            const newPassword = document.getElementById('new-password').value;
            const user = auth.currentUser;

            if (!oldPassword || !newPassword) {
                alert("Please fill in both fields.");
                return;
            }

            // Re-authenticate the user using their old password
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            reauthenticateWithCredential(user, credential)
                .then(() => {
                    // Successfully re-authenticated, now update the password
                    updatePassword(user, newPassword)
                        .then(() => {
                            alert("Password changed successfully.");
                            document.getElementById('password-change-section').style.display = 'none'; // Hide password change form
                        })
                        .catch(error => {
                            console.error("Error changing password:", error);
                            alert("Failed to change password. Please try again.");
                        });
                })
                .catch(error => {
                    console.error("Re-authentication failed:", error);
                    alert("Old password is incorrect. Please try again.");
                });
        });
    } else {
        window.location = '../index.html'; // Redirect to login page if user is not logged in
    }
});



