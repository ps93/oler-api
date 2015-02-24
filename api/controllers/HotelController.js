/**
 * HotelController
 *
 * @description :: Server-side logic for managing hotels
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {

    var params = req.body;

    if (params.name && params.id) Hotel.Insert(res, params);

    else res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  hotelById: function (req, res) {

    var params = req.params;

    if (params.id_hotel)
      Hotel.HotelById(res, params.id_hotel);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

