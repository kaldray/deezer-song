import "./authentification.js";
import { renderSongs, onTogglePlayPause, onPlay } from "./functions.js";
import { addEvents } from "./utils.js";
import firebaseServices from "./firebaseServices.js";

const NB_FAVS_PER_PAGE = 5;

const favsContainer = document.querySelector("#favorites");
const player = document.querySelector("#player-container audio");
const navsContainers = document.querySelectorAll("#nav_top, #nav_bottom");

addEvents(favsContainer, "click", ".play-button", onPlay);
addEvents(player, "play pause", onTogglePlayPause);
addEvents(favsContainer, "click", ".fav-button", onRemoveFavorite);
addEvents(navsContainers[0], "click", ".page-link", onChangePage);
addEvents(navsContainers[1], "click", ".page-link", onChangePage);

let currentPage = 1;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        generatePage(currentPage);
    }
});

function onChangePage() {
    let pageClicked = Number(this.dataset.id);
    currentPage = pageClicked;
    generatePage(pageClicked);
}

function generatePage(page) {
    firebaseServices.getCurrentUserFavorites().then((userFavorites) => {
        // On n'a ici besoin que du tableau d'objets et non du pushId de Firebase
        userFavorites = userFavorites.map((fav) => fav[1]);

        let nbPages = Math.ceil(userFavorites.length / NB_FAVS_PER_PAGE);

        const favs = userFavorites.splice(
            (page - 1) * NB_FAVS_PER_PAGE,
            NB_FAVS_PER_PAGE
        );

        const html = renderSongs(favs, favs);
        favsContainer.innerHTML = html;

        // Generate paginations
        navsContainers.forEach((container) => {
            container.innerHTML = renderPagination(nbPages, page);
        });
    });
}

function onRemoveFavorite() {
    const favButton = this;
    const songElement = favButton.closest(".song");
    const clickedSongID = Number(songElement.dataset.songId);

    firebaseServices.getCurrentUserFavorites().then((userFavorites) => {
        // Vérifie si l'identifiant "clickedSongID" n'est pas déjà dans les favoris
        let fav = userFavorites.find(
            ([pushId, song]) => song.id === clickedSongID
        );

        // Si OUI : on la retire
        if (fav) {
            let pushId = fav[0];

            firebaseServices.removeFavoriteForCurrentUser(pushId).then(() => {
                const row = songElement.parentNode;
                row.parentNode.removeChild(row);

                generatePage(currentPage);
            });
        }
    });
}

function renderPagination(nbPages, currentPage) {
    let html = `<ul class="pagination justify-content-center">
                    <li class="page-item ${
                        currentPage === 1 ? "disabled" : ""
                    }">
                        <a data-id="${
                            currentPage - 1
                        }" class="page-link" href="#">
                            Précédent
                        </a>
                    </li>`;

    for (let i = 1; i <= nbPages; i++) {
        html += `<li class="page-item ${currentPage === i ? "active" : ""}">
                    <a data-id="${i}" class="page-link" href="#">${i}</a>
                </li>`;
    }

    html += `<li class="page-item ${currentPage === nbPages ? "disabled" : ""}">
                <a data-id="${currentPage + 1}" class="page-link" href="#">
                    Suivant
                </a>
            </li>
        </ul>`;

    return html;
}
