import {
    getFavoriteFromStorage,
    renderSongs,
    onTogglePlayPause,
    onPlay,
    saveFavoritesToStorage,
} from "./functions.js";
import { addEvents } from "./utils.js";

const NB_SONGS_PER_PAGE = 5;

const favsContainer = document.querySelector("#favorites");
const player = document.querySelector("#player-container audio");
const navContainers = document.querySelectorAll("#nav_top, #nav_bottom");

// Lorsqu'on clique sur un bouton "Ecouter"
addEvents(favsContainer, "click", ".play-button", onPlay);
// Lorsqu'on joue/stoppe la lecture du player <audio> de la .navbar
addEvents(player, "play pause", onTogglePlayPause);
// Lorsqu'on clique sur le bouton de favoris
addEvents(favsContainer, "click", ".fav-button", onRemoveFavorite);
// Lorsqu'on clique sur un élément de pagination
addEvents(navContainers[0], "click", ".page-link", onPaginate);
addEvents(navContainers[1], "click", ".page-link", onPaginate);

const FAVORITES = getFavoriteFromStorage();
const nbPages = Math.ceil(FAVORITES.length / NB_SONGS_PER_PAGE);
let currentPage = 2;

displayPagination();
displayFavorites();

function onPaginate() {
    console.log("click");
    currentPage = Number(this.parentNode.dataset.page);

    displayPagination();
    displayFavorites();
}

function displayPagination() {
    const pagination = renderPagination(nbPages, currentPage);
    navContainers.forEach((container) => {
        container.innerHTML = pagination;
    });
}

function displayFavorites() {
    const FAVORITES = getFavoriteFromStorage();

    let start = (currentPage - 1) * NB_SONGS_PER_PAGE;
    let favs = FAVORITES.splice(start, NB_SONGS_PER_PAGE);
    const html = renderSongs(favs);
    favsContainer.innerHTML = html;
}

function onRemoveFavorite() {
    const FAVORITES = getFavoriteFromStorage();

    const clickedFav = this;

    const songElement = clickedFav.closest(".song");
    const clickedSongID = Number(songElement.dataset.songId);

    const indexToDelete = FAVORITES.findIndex(
        (song) => song.id === clickedSongID
    );

    FAVORITES.splice(indexToDelete, 1);

    saveFavoritesToStorage(FAVORITES);

    // Suppression du DOM de l'élément retiré
    songElement.parentNode.removeChild(songElement);
}

function renderPagination(nbPages, currentPage = 1) {
    let html = "";

    for (let i = 1; i <= nbPages; i++) {
        html += `<li class="page-item ${
            currentPage === i ? "active" : ""
        }" data-page="${i}"><a class="page-link" href="#">${i}</a></li>`;
    }

    return `<ul class="pagination justify-content-center">
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#">Précédent</a>
                </li>
                ${html}
                <li class="page-item ${
                    currentPage === nbPages ? "disabled" : ""
                }">
                    <a class="page-link" href="#">Suivant</a>
                </li>
            </ul>`;
}
