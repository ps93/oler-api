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
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  }

};

