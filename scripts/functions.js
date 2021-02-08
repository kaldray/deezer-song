import { getFirstSibling } from "./utils.js";

const STORAGE_KEY = "deezweb.favorites";

export function renderSongs(songsArray) {
    const FAVORITES = getFavoriteFromStorage();
    return songsArray
        .map((track) => {
            const isInFavorites = FAVORITES.some(
                (item) => item.id === track.id
            );
            return `
            <div class="col mb-4">
                <div class="card song" data-song-id="${track.id}">
                    <div class="row no-gutters">
                        <div class="col-md-5">
                            <img src="${
                                track.album.cover_big
                            }" class="card-img" alt="${track.title}">
                        </div>
                        <div class="col-md-7">
                            <div class="card-body">
                                <h5 class="card-title">${track.title}</h5>
                                <p class="card-text">${track.artist.name} / ${
                track.album.title
            }</p>
            ${
                isInFavorites
                    ? `<button class="fav-button btn btn-sm btn-outline-danger btn-danger" title="Retirer des favoris">❤</button>`
                    : `<button class="fav-button btn btn-sm btn-outline-danger" title="Ajouter aux favoris">🤍</button>`
            }
                                <button class="play-button btn btn-sm btn-info" title="Écouter un extrait" data-file=${
                                    track.preview
                                }>Écouter</button>
                                <a href="${
                                    track.link
                                }" class="stretched-link" target="_blank" title="Écouter sur Deezer.com">Écouter sur Deezer.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        })
        .join("");
}

export function onPlay() {
    const playerContainer = document.querySelector("#player-container");
    const link = playerContainer.querySelector("a");
    const player = playerContainer.querySelector("audio");
    const music = playerContainer.querySelector(".music");

    const buttonClicked = this;

    let songTitle = getFirstSibling(
        buttonClicked,
        "h5.card-title"
    ).textContent.trim();
    let songLink = getFirstSibling(buttonClicked, "a.stretched-link").href;
    songTitle =
        songTitle.length > 40 ? `${songTitle.slice(0, 40)}…` : songTitle;
    let songFile = buttonClicked.dataset.file;

    playerContainer.classList.remove("d-none");
    playerContainer.classList.add("d-flex", "pulse-once");
    playerContainer.onanimationend = function () {
        playerContainer.classList.remove("pulse-once");
        playerContainer.onanimationend = undefined;
    };

    // Update du lien <a>
    link.textContent = songTitle;
    link.href = songLink;
    // Update de l'<audio>
    player.src = songFile;
    player.autoplay = true; // Lancement de la lecture
    music.classList.add("music-animated");
}

// Fonction appelée dès que le player <audio> est mit en pause ou play
export function onTogglePlayPause() {
    const playerContainer = document.querySelector("#player-container");
    const player = playerContainer.querySelector("audio");
    const music = playerContainer.querySelector(".music");

    if (player.paused == true) {
        music.classList.remove("music-animated");
    } else {
        music.classList.add("music-animated");
    }

    console.log(player.paused);
}

// Fonction poyr recuperer depuis le storage du navigateur
export function getFavoriteFromStorage() {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || [];
}

// FUNCTION POUR SAUVEGARDER DANS LE NAVIGATEUR

export function saveFavoritesToStorage(favoritesArray = []) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesArray)) ||
        [];
}
