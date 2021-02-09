import firebaseConfig from "./firebaseConfig.js";
import { addEvents } from "./utils.js";

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        logUser(user);
    }
});

const login = document.querySelector("#login");
const member = document.querySelector("#member");
const member2 = document.querySelector(".dropdown-item");

// ==========================
// Gestionnaires d'événéments
// ==========================

// Lorsqu'on se connecte via Github
addEvents(login, "click", "a", onLogin);
addEvents(member2, "click", "a", signOut);

// =========
// Fonctions
// =========

// Lorsqu'on clique sur le bouton "se connecter avec Github"
function onLogin() {
    let githubProvider = new firebase.auth.GithubAuthProvider();

    firebase
        .auth()
        .signInWithPopup(githubProvider)
        .then((result) => {
            logUser(result.user);
        });
}

function logUser(user) {
    let photoURL = user.photoURL;
    let displayName = user.email;

    // Affichage des infos
    member.classList.remove("d-none");
    member.querySelector("img").src = photoURL;
    member.querySelector("#member-name").textContent = displayName;

    // Masque le lien de connexion
    login.classList.add("d-none");
}

function signOut() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("Sign-out successful");
            login.classList.remove("d-none");
            member2.classList.add("d-none");
            member.classList.add('d-none')
        })
        .catch((error) => {
            // An error happened.
        });
}
