export default {
    // recuperer l'utilisateur Firebase en cours
    getCurrentUser() {
        let user = firebase.auth().currentUser;

        if (!user) {
            throw new Error("No authentifaction user !");
        }
        return user;
    },

    // Récupérer la référence de l'utilisateur Firebase en cours
    getUserFavoritesRef() {
        let user = this.getCurrentUser();

        let uid = user.uid;

        let favsRef = firebase.database().ref(`favorites/${uid}`);

        return favsRef;
    },

    // Récupère une promesse avec la liste des favoris de l'utilisateur courant
    async getCurrentUserFavorites() {
        let favsRef = this.getUserFavoritesRef();

        return favsRef.once("value").then((snapshot) => {
            let data = snapshot.toJSON();
            let userFavorites = data ? Object.entries(data) : [];

            return userFavorites;
        });
    },

    // Insérer en base un nouveau favoris à l'utilisateur courant
    async addFavoriteForCurrentUser(favObject) {
        let favsRef = this.getUserFavoritesRef();

        return favsRef.push(favObject);
    },

    // Supprimer de la base un favoris via son ID firebase
    async removeFavoriteForCurrentUser(pushId) {
        let favsRef = this.getUserFavoritesRef();

        return favsRef.child(pushId).remove();
    },
};
