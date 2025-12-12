// Firebase imports 
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJQIPdKQsGUvqGoFOZQU5MvjGNmoBsYKc",
  authDomain: "collaborativenews-feed.firebaseapp.com",
  projectId: "collaborativenews-feed",
  storageBucket: "collaborativenews-feed.firebasestorage.app",
  messagingSenderId: "205540770478",
  appId: "1:205540770478:web:edee6d71dc4db9b7a6e33f"
};

//Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// HTML elements
const authBox = document.getElementById("authBox");
const postBox = document.getElementById("postBox");
const messagesBox = document.getElementById("messagesBox");

const signupForm = document.getElementById("signupForm");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("messageInput");

const logoutBtn = document.getElementById("logoutBtn");
const messagesDiv = document.getElementById("messages");

// INSCRIPTION (-> l'utilisateur est dierectement connecté)
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await createUserWithEmailAndPassword(
      auth,
      signupEmail.value,
      signupPassword.value
    );
    signupForm.reset();
    alert("Compte créé et connecté !");
  } catch (error) {
    alert("Erreur inscription : " + error.message);
    console.error(error);
  }
});


// CONNEXION
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );
    loginForm.reset();
  } catch (error) {
    if (error.code === "auth/invalid-credential") {
      alert("Compte inexistant");
    } else {
      alert("Erreur de connexion : " + error.message);
    }
  }
});



// ÉTAT UTILISATEUR
onAuthStateChanged(auth, (user) => {
  if (user) {
    authBox.style.display = "none";
    postBox.style.display = "block";
    messagesBox.style.display = "block";
  } else {
    authBox.style.display = "block";
    postBox.style.display = "none";
    messagesBox.style.display = "none";
  }
});

// DÉCONNEXION
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// PUBLIER UN MESSAGE
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("Tu dois être connecté.");

  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    message: text,    
    email: user.email,           
    createdAt: serverTimestamp() 
  });

  messageInput.value = "";
});


// AFFICHAGE TEMPS RÉEL (UNIQUEMENT APRÈS CONNEXION)
const q = query(
  collection(db, "messages"),
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {
  messagesDiv.innerHTML = "";

  snapshot.forEach((doc) => {
    const m = doc.data();

    const email = m.email ?? "Utilisateur inconnu";
    const message = m.message ?? m.text ?? "";
    const date = m.createdAt?.toDate();
    const formattedDate = date
      ? date.toLocaleString("fr-FR")
      : "heure inconnue";

    const p = document.createElement("p");
    p.textContent = `${email} — ${formattedDate} : ${message}`;

    messagesDiv.appendChild(p);
  });
});



