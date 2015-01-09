var access = require('../app/controllers/access'),
    hotelFavourites = require('../app/controllers/hotelFavourites'),
    functionalities = require('../app/controllers/functionalities');

// ROUTES
// ==============================================
module.exports = function (router) {

    // LOGIN WITH EMAIL
    router.route('/login/email')
        .post(access.loginWithEmail);

    // REGISTRATION WITH EMAIL
    router.route('/registration/email')
        .post(access.registrationWithEmail);

    // REGISTRATION WITH SOCIAL
    router.route('/access/social')
        .post(access.accessWithSocial);

    // SET PASSWORD
    router.route('/set-password')
        .post(access.setPassword);

    // HOTEL FAVOURITES

    router.route('/hotel-favourites/:id_user')
        .get(hotelFavourites.hotelsFavouritesByUserId);

    router.route('/hotel-favourites/:id_user/:hotel_code')
        .delete(hotelFavourites.remove);

    router.route('/hotel-favourites')
        .post(hotelFavourites.insertAndUpdate);


    /*router.route('/send-email')
     .post(functionalities.shareApp);*/

};