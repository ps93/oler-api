/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  'GET /': {view: 'homepage'},

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   *  If a request to a URL doesn't match any of the custom routes above, it  *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/

  // ACCESSO E REGISTRAZIONE
  'POST /api/v1/registration/email': {controller: 'UserController', action: 'registrationWithEmail'},
  'POST /api/v1/login/email': {controller: 'UserController', action: 'login'},
  'POST /api/v1/access/social': {controller: 'UserController', action: 'social'},
  'POST /api/v1/set-password': {controller: 'UserController', action: 'setPassword'},

  // PROFILO
  'GET /api/v1/user/:id_user': {controller: 'UserController', action: 'myProfile'},

  // CONDIVISIONE DELL'APP
  'POST /api/v1/shareapp': {controller: 'ShareappController', action: 'insert'},

  // HOTEL
  'GET /api/v1/hotels/:id_hotel': {controller: 'HotelController', action: 'hotelById'},

  // AMICI
  'GET /api/v1/friends/:id_user': {controller: 'FriendController', action: 'myFriends'},
  'GET /api/v1/friends/:id_user/:id_friend': {controller: 'FriendController', action: 'addFakeFriend'},
  'DELETE /api/v1/friends/:id_user/:id_friend': {controller: 'FriendController', action: 'removeFakeFriend'},

  // HOTEL PREFERITI
  'GET /api/v1/favourites/:id_user': {controller: 'FavouriteController', action: 'myFavourites'},
  'POST /api/v1/favourites': {controller: 'FavouriteController', action: 'insert'},
  'DELETE /api/v1/favourites/:id_user/:id_hotel': {controller: 'FavouriteController', action: 'remove'},

  // HOTEL CONSIGLIATI
  'GET /api/v1/recommended-friends/:id_user': {controller: 'RecommendedController', action: 'friendsRecommended'},
  'GET /api/v1/hotels-usersrecommended/:id_user': {controller: 'RecommendedController', action: 'hotelsUsersRecommended'},
  'GET /api/v1/status-hotel-recommended/:id_hotel/:id_user': {controller: 'RecommendedController', action: 'approvedHotelRecommended'},
  'POST /api/v1/recommended': {controller: 'RecommendedController', action: 'insert'},
  'DELETE /api/v1/status-hotel-recommended/:id_hotel/:id_user': {controller: 'RecommendedController', action: 'deniedHotelRecommended'},

  //CREDITI
  'GET /api/v1/credits/:id_user': {controller: 'CreditController', action: 'myCredits'},
  'POST /api/v1/credits': {controller: 'CreditController', action: 'insertCredit'}

};
