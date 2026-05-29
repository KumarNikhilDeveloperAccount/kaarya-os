const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, sendSignInLinkToEmail } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBIOlRVzimAdMotWYumnbeL9JjUXp39r3Q", // Lowercase l
  authDomain: "kaarya-os.firebaseapp.com",
  projectId: "kaarya-os",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const actionCodeSettings = {
  url: 'http://localhost:3000/login',
  handleCodeInApp: true,
};

console.log("Attempting to send Magic Link to nkashyapnikhilnk@gmail.com...");

sendSignInLinkToEmail(auth, "nkashyapnikhilnk@gmail.com", actionCodeSettings)
  .then(() => {
    console.log("SUCCESS! Magic Link sent.");
  })
  .catch((error) => {
    console.error("FIREBASE ERROR:", error.code, error.message);
  });
