var UserController = require('../app/controllers/UserController'),
    UserFriendsController = require('../app/controllers/UserFriendsController'),
    hotelFavourites = require('../app/controllers/hotelFavourites'),
    ShareAppController = require('../app/controllers/ShareappController'),
    RecommendedHotelController = require('../app/controllers/RecommendedHotelController');

// ROUTES
// ==============================================
module.exports = function (router) {

    // ACCESS
    router.route('/login/email')
        .post(UserController.loginWithEmail);
    router.route('/registration/email')
        .post(UserController.registrationWithEmail);
    router.route('/access/social')
        .post(UserController.loginOrRegistationWithSocial);
    router.route('/set-password')
        .post(UserController.changePassword);

    // FRIENDS
    router.route('/friends/:id_user')
        .get(UserFriendsController.userFriendList);

    // HOTEL FAVOURITES
    router.route('/hotel-favourites/:id_user')
        .get(hotelFavourites.hotelsFavouritesByUserId);
    router.route('/hotel-favourites/:id_user/:google_key')
        .delete(hotelFavourites.remove);
    router.route('/hotel-favourites')
        .post(hotelFavourites.insertAndUpdate);

    // HOTEL RECOMMENDED
    router.route('/hotel-recommended')
        .post(RecommendedHotelController.insertRecommendedHotel);

    router.route('/hotel-recommended/:id_user')
        .get(RecommendedHotelController.recommendedHotelsByUser);

    // USER PROFILE
    /*  router.route('/user/:_id')
     .get(user.getUserData);*/

    // SHARE APP
    router.route('/share-app')
        .post(ShareAppController.insertOrUpdate);

};