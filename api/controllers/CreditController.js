/**
 * CreditsController
 *
 * @description :: Server-side logic for managing credits
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insertCredit: function (req, res) {
    var params = req.body;

    if (params.id_user && params.id_hotel && params.id_reservation)
      Credit.InsertCredit(res, params.id_user, params.id_hotel, params.id_reservation);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myCredits: function (req, res) {
    var params = req.params;

    if (params.id_user)
      Credit.MyCredits(res, params.id_user);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

