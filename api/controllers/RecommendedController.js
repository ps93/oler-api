/**
 * RecommendedController
 *
 * @description :: Server-side logic for managing recommendeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {
    var params = req.body;

    if (params.id_user && params.id_hotel && params.friends && params.friends.length > 0 && params.hasOwnProperty('is_hotelnet')) {
      Recommended.Insert(res, params.id_user, params.id_hotel, params.friends, params);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  friendsRecommended: function (req, res) {
    var params = req.params;

    if (params.id_user) {
      Recommended.FriendsRecommended(res, params.id_user);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  hotelsUsersRecommended: function (req, res) {
    var params = req.params;

    if (params.id_user) {
      Recommended.HotelsUsersRecommended(res, params.id_user);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  approvedHotelRecommended: function (req, res) {
    var params = req.params;

    if (params.id_hotel && params.id_hotel) {
      Recommended.ApprovedHotelRecommended(res, params.id_hotel, params.id_user);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  deniedHotelRecommended: function (req, res) {
    var params = req.params;

    if (params.id_hotel && params.id_user) {
      Recommended.DeniedHotelRecommended(res, params.id_hotel, params.id_user);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  hotelUsersRecommended: function (req, res) {
    var params = req.params;

    if (params.id_hotel && params.id_user && params.id_hotel) {
      Recommended.HotelUsersRecommended(res, params.id_user, params.id_hotel);
    }
    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

