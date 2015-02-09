/**
 * HotelController
 *
 * @description :: Server-side logic for managing hotels
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {

    var params = req.body;

    if (params.name && params.id) {
      Hotel.Insert(res, params);
    }
    else {
      return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
    }

  }

};

