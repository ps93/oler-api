/**
 * FavouriteController
 *
 * @description :: Server-side logic for managing favourites
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {
    var params = req.body;

    if (params.id_user && params.id_hotel && params.name) {
      Favourite.Insert(res, params.id_user, params.id_hotel, params.name);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  },

  remove: function (req, res) {
    var params = req.params;

    if (params.id_user && params.id_hotel) {
      Favourite.Remove(res, params.id_user, params.id_hotel);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  },

  myFavourites: function (req, res) {
    var params = req.params;

    if (params.id_user) {
      Favourite.MyFavourites(res, params.id_user);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }
  }

};

