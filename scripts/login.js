import firebaseConfig from "./firebaseConfig.js";
import { addEvents } from "./utils.js";

firebase.initializeApp(firebaseConfig);

const login = document.querySelector("#login");

addEvents(login, "click", onLogin);

// @ToDo
// Dans le onLogin, on va rediriger vers la page "index.html"
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        redirect();
    }
});

function onLogin() {
    let githubProvider = new firebase.auth.GithubAuthProvider();
    firebase
        .auth()
        .signInWithPopup(githubProvider)
        .then((redirect));

}

function redirect() {
    window.location.href = "index.html";
}
