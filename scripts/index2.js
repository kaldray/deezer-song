import fetchJsonp from "../lib/fetch-jsonp.js";
import { addEvents, getFirstSibling } from "./utils.js";
import {
    renderSongs,
    onPlay,
    onTogglePlayPause,
    getFavoriteFromStorage,
    saveFavoritesToStorage,
} from "./functions.js";

 export const FAVORITES = getFavoriteFromStorage();
let l;
const form = document.querySelector("form");
// const results = document.querySelector("#results-list");
const resultsContainer = document.querySelector("#search-results");
const success = resultsContainer.querySelector(".text-success");
const error = resultsContainer.querySelector(".text-danger");
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

addEvents(player, "play pause", onTogglePlayPause);

addEvents(resultsContainer, "click", ".fav-button", onToggleFavorite);

function onScroll() {
    let positionAscenseur = Math.ceil(window.scrollY);
    let hauteurDocument = document.documentElement.scrollHeight;
    let hauteurFenetre = window.innerHeight;

    if (positionAscenseur >= hauteurDocument - hauteurFenetre) {
        console.log(
            "Bas de page atteint ! Chargement des résultats suivants ..."
        );
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
                let html = renderSongs(data);

                results.innerHTML += html;
            });
    }
}

function submitForm(event) {
    event.preventDefault();
    let requete;
    requete = recuperation.value;

    // Création et affichage d'un spinner
    const spinner = document.createElement("div");
    spinner.classList.add("spinner");
    form.appendChild(spinner);

    fetchJsonp(`https://api.deezer.com/search?q=${requete}&output=jsonp`)
        .then((res) => res.json())
        .then(({ data, total, next }) => {
            nextURL = next;
            resultsContainer.classList.remove("d-none");
            success.classList.remove("d-none");
            success.querySelector("strong").textContent = total;
            let html = renderSongs(data);
            results.innerHTML = html;
            spinner.parentNode.removeChild(spinner);
        });
}

function onToggleFavorite() {
    let favButton = this;
    // Récupérer un identifiant unique permettant d'identifier la musique
    let clickedSongID = favButton.closest(".song").dataset.songId;
    clickedSongID = Number(clickedSongID);

    // Vérifie si cet identifiant n'est pas déjà dans les favoris
    let index = FAVORITES.findIndex((song) => song.id === clickedSongID);

    // Si OUI : on la retire
    if (index > -1) {
        FAVORITES.splice(index, 1);
        // Sauvegarde le tableau mis à jour dans le local storage du navigateur
        saveFavoritesToStorage(FAVORITES);
        setButtonMode(favButton, "normal");
    }
    // Si NON : on l'ajoute
    else {
        setButtonMode(favButton, "waiting");
        fetchJsonp(
            `https://api.deezer.com/track/${clickedSongID}/?output=jsonp`
        )
            .then((res) => res.json())
            .then((response) => {
                FAVORITES.push(response);

                // Sauvegarde le tableau mis à jour dans le local storage du navigateur
                saveFavoritesToStorage(FAVORITES);
                setButtonMode(favButton, "highlighted");
            });
    }
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
