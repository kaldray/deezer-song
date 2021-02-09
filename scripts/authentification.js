import firebaseConfig from "./firebaseConfig.js";
import { addEvents } from "./utils.js";

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        let photoURL = user.photoURL;
        let displayName = user.email;

        // Affichage des infos
        member.classList.remove("d-none");
        member.querySelector("img").src = photoURL;
        member.querySelector("#member-name").textContent = displayName;
    } else {
        window.location.href = "login.html";
    }
});

const login = document.querySelector("#login");
const member = document.querySelector("#member");
const member2 = document.querySelector(".dropdown-item");

// Lorsqu'on se connecte via Github

addEvents(member2, "click", "a", logOut);

// =========
// Fonctions
// =========

function logOut() {
    firebase
        .auth()
        .signOut()
        .then(() => {
            console.log("Sign-out successful");
        });
}
