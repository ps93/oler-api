/**
 * FriendController
 *
 * @description :: Server-side logic for managing friends
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  myFriends: function (req, res) {

    var params = req.params;

    if (params.id_user) {
      Friend.MyFriends(res, params.id_user);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  addFakeFriend: function (req, res) {

    var params = req.params;

    if (params.id_user && params.id_friend) {
      Friend.AddFakeFriend(res, params.id_user, params.id_friend);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  removeFakeFriend: function (req, res) {

    var params = req.params;

    if (params.id_user && params.id_friend) {
      Friend.RemoveFakeFriend(res, params.id_user, params.id_friend);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});

  },

  addFriendOnRequest: function (req, res) {

    var params = req.body;

    if (params.id_user && params.contacts && _.isArray(params.contacts) && params.contacts.length > 0) {
      var contacts = ValidationService.ValidationTrim(params.contacts, 'email');
      Friend.AddFriendOnRequest(res, params.id_user, contacts);
    }
    else res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});

  }

};

