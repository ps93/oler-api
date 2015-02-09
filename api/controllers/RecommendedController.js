/**
 * RecommendedController
 *
 * @description :: Server-side logic for managing recommendeds
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {
    var params = req.body;

    if (params.id_user && params.id_hotel && params.friends && params.friends.length > 0) {
      Recommended.Insert(res, params.id_user, params.id_hotel, params.friends);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  },

  userRecommended: function (req, res) {
    var params = req.params;

    if (params.id_user) {
      Recommended.UserRecommended(res, params.id_user);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  },

  friendsRecommended: function (req, res) {
    var params = req.params;

    if (params.id_user) {
      Recommended.FriendsRecommended(res, params.id_user);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  }

};

