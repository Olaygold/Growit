
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
  import { getDatabase, ref, update, get, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

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

  // Start OPay Checkout
  async function startOpayCheckout(amount, email) {
    const reference = "OPAY" + new Date().getTime();

    const body = {
      amount: amount * 100,
      reference: reference,
      currency: "NGN",
      returnUrl: "deposit.html?ref=" + reference, // Set your own redirect URL
      customerEmail: email,
      paymentMethod: "CARD"
    };

    try {
      const res = await fetch("https://sandboxapi.opaycheckout.com/api/v3/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: "Bearer OPAYPUB17479001665220.25637491704034554",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (result?.data?.cashierUrl) {
        window.location.href = result.data.cashierUrl;
      } else {
        alert("Failed to initialize payment.");
        console.log(result);
      }
    } catch (err) {
      console.error("OPay error:", err);
      alert("Error connecting to OPay.");
    }
  }

  // Handle Deposit Submission
  document.getElementById("deposit-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = parseInt(document.getElementById("amount").value);
    if (amount < 100) {
      alert("Minimum deposit is 100 Naira.");
      return;
    }

    startOpayCheckout(amount, currentUser.email); // Replace Paystack with OPay call
  });

  // Update Firebase Balance and Save Deposit Information (manually call this after confirming payment)
  window.updateBalance = function (amount) {
    const userRef = ref(db, `users/${currentUser.uid}`);
    const depositId = new Date().getTime();

    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const newBalance = (userData.balance || 0) + amount;

          const referralCode = userData.referralCode;
          const isFirstDeposit = !userData.firstDeposit;

          update(userRef, { balance: newBalance, firstDeposit: true })
            .then(() => {
              const depositData = {
                amount: amount,
                timestamp: new Date().toISOString(),
                status: "successful",
                userEmail: currentUser.email,
              };

              update(ref(db, `deposits/${currentUser.uid}/${depositId}`), depositData)
                .then(() => {
                  alert(`Deposit of ${amount} Naira successful!`);
                  fetchBalance();

                  if (referralCode && isFirstDeposit) {
                    const commissionAmount = amount * 0.20;

                    get(ref(db, `users/${referralCode}`))
                      .then((referralSnapshot) => {
                        if (referralSnapshot.exists()) {
                          const referrerData = referralSnapshot.val();
                          const referrerId = referralSnapshot.key;
                          const newReferrerBalance = (referrerData.balance || 0) + commissionAmount;

                          update(ref(db, `users/${referrerId}`), { balance: newReferrerBalance })
                            .then(() => {
                              const referralData = {
                                email: currentUser.email,
                                commission: commissionAmount,
                              };
                              const referralId = new Date().getTime();

                              set(ref(db, `referrals/${referrerId}/${referralId}`), referralData)
                                .then(() => {
                                  console.log(`Commission of ${commissionAmount} Naira awarded to referrer.`);
                                })
                                .catch((error) => {
                                  console.error("Error saving referral data:", error);
                                });
                            })
                            .catch((error) => {
                              console.error("Error updating referrer's balance:", error);
                            });
                        } else {
                          console.error("Referrer not found.");
                        }
                      })
                      .catch((error) => {
                        console.error("Error fetching referrer's data:", error);
                      });
                  }
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
  };
