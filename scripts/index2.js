import fetchJsonp from "../lib/fetch-jsonp.js";
import { addEvents, getFirstSibling } from "./utils.js";
import {
    renderSongs,
    onPlay,
    onTogglePlayPause,
    getFavoriteFromStorage,
    saveFavoritesToStorage,
} from "./functions.js";
import "./authentification.js";
import firebaseServices from "./firebaseServices.js";

const form = document.querySelector("form");
const resultsContainer = document.querySelector("#search-results");
const success = resultsContainer.querySelector(".text-success");
const results = document.querySelector("#songresult");
const recuperation = document.querySelector("#searchText");
const player = document.querySelector("#player-container audio");

let nextURL = "";
let resultsLoaded = true;

// Lorsqu'on valide le formulaire
addEvents(form, "submit", submitForm);
// Lorsqu'on scrolle dans la page
addEvents(document, "scroll", onScroll);
// Lorsqu'on clique sur un bouton "Ecouter"
addEvents(resultsContainer, "click", ".play-button", onPlay);
// Animation des barres musicales
addEvents(player, "play pause", onTogglePlayPause);

addEvents(resultsContainer, "click", ".fav-button", onToggleFavorite);

function onScroll() {
    let positionAscenseur = Math.ceil(window.scrollY);
    let hauteurDocument = document.documentElement.scrollHeight;
    let hauteurFenetre = window.innerHeight;

    if (positionAscenseur >= hauteurDocument - hauteurFenetre) {
        loadNextResults();
    }
}

function loadNextResults() {
    if (nextURL && resultsLoaded) {
        // Création et affichage d'un spinner
        const spinner = document.createElement("div");
        spinner.classList.add("spinner", "m-auto");
        resultsContainer.appendChild(spinner);

        resultsLoaded = false;

        fetchJsonp(nextURL)
            .then((res) => res.json())
            .then(({ data, next }) => {
                nextURL = next;
                resultsLoaded = true;

                // Supprime le spinner
                spinner.parentNode.removeChild(spinner);

                // Rendering du HTML des musiques
                let html = renderSongs(data, userFavorites);

                results.innerHTML += html;
            })
            .then(() => firebaseService.getCurrentUserFavorites())
            .then((userFavorites) => {
                userFavorites = userFavorites.map((fav) => fav[1]);

                // Rendering du HTML des musiques
                let html = renderSongs(deezerData, userFavorites);

                results.innerHTML += html;
            });
    }
}

function submitForm(event) {
    event.preventDefault();
    let requete;
    requete = recuperation.value;
    fetchJsonp(`https://api.deezer.com/search?q=${requete}&output=jsonp`)
        .then((res) => res.json())
        .then(({ data, total, next }) => {
            nextURL = next;

            // Création et affichage d'un spinner
            const spinner = document.createElement("div");
            spinner.classList.add("spinner");
            form.appendChild(spinner);

            spinner.parentNode.removeChild(spinner);

            firebaseServices.getCurrentUserFavorites().then((userFavorites) => {
                // On n'a ici besoin que du tableau d'objets et non du pushId de Firebase
                userFavorites = userFavorites.map((fav) => fav[1]);

                //  Affichage de la zone de resulats
                resultsContainer.classList.remove("d-none");
                success.classList.remove("d-none");
                success.querySelector("strong").textContent = total;
                let html = renderSongs(data, userFavorites);
                results.innerHTML = html;
            });
        });
}

function onToggleFavorite() {
    let favButton = this;
    // Récupérer un identifiant unique permettant d'identifier la musique
    let clickedSongID = favButton.closest(".song").dataset.songId;
    clickedSongID = Number(clickedSongID);

    setButtonMode(favButton, "waiting");

    // Récupération des favoris de l'utilisateur
    firebaseServices.getCurrentUserFavorites().then((userFavorites) => {
        // Vérifie si l'identifiant "clickedSongID" n'est pas déjà dans les favoris
        let fav = userFavorites.find(
            ([pushId, song]) => song.id === clickedSongID
        );

        if (fav) {
            let pushId = fav[0];
            firebaseServices
                .removeFavoriteForCurrentUser(pushId)
                .then(() => setButtonMode(favButton, "normal"));
        } else {
            fetchJsonp(
                `https://api.deezer.com/track/${clickedSongID}/?output=jsonp`
            )
                .then((res) => res.json())
                .then((response) =>
                    firebaseServices
                        .addFavoriteForCurrentUser(response)
                        .then(() => setButtonMode(favButton, "highlighted"))
                );
        }
    });
}

function setButtonMode(buttonElement, mode = "normal") {
    switch (mode) {
        case "normal":
            buttonElement.classList.remove("btn-danger", "disabled");
            buttonElement.textContent = "🤍";
            buttonElement.title = "Ajouter aux favoris";
            buttonElement.disabled = false;
            break;

        case "waiting":
            buttonElement.textContent = "...";
            buttonElement.classList.add("disabled");
            buttonElement.disabled = true;
            break;

        case "highlighted":
            buttonElement.classList.remove("disabled");
            buttonElement.classList.add("btn-danger");
            buttonElement.textContent = "❤";
            buttonElement.title = "Retirer des favoris";
            buttonElement.disabled = false;
            break;
    }
}
