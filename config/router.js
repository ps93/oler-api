var access = require('../app/controllers/access'),
    hotelFavourites = require('../app/controllers/hotelFavourites'),
    shareApp = require('../app/controllers/shareApp'),
    user = require('../app/controllers/users');

// ROUTES
// ==============================================
module.exports = function (router) {

    // ACCESS
    router.route('/login/email')
        .post(access.loginWithEmail);
    router.route('/registration/email')
        .post(access.registrationWithEmail);
    router.route('/access/social')
        .post(access.accessWithSocial);
    router.route('/set-password')
        .post(access.setPassword);

    // HOTEL FAVOURITES
    router.route('/hotel-favourites/:id_user')
        .get(hotelFavourites.hotelsFavouritesByUserId);
    router.route('/hotel-favourites/:id_user/:hotel_code')
        .delete(hotelFavourites.remove);
    router.route('/hotel-favourites')
        .post(hotelFavourites.insertAndUpdate);

    // USER PROFILE
    router.route('/user/:_id')
        .get(user.getUserData);

    // SHARE APP
    router.route('/share-app')
        .post(shareApp.insertAndUpdate);

    router.route('/send-email')
        .post(shareApp.insertAndUpdate);

};