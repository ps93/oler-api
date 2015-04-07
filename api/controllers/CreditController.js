/**
 * CreditsController
 *
 * @description :: Server-side logic for managing credits
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insertCredit: function (req, res) {
    var params = req.body;

    if (params.id_user
      && params.id_hotel
      && params.id_reservation
      && params.total_reservation
      && params.reservation_date
      && params.currency) {

      Credit.InsertCredit(
        res,
        params.id_user,
        params.id_hotel,
        params.id_reservation,
        params.total_reservation,
        params.reservation_date,
        params.currency
      );

    }

    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myCredits: function (req, res) {
    var params = req.params;

    if (params.id_user)
      Credit.MyCredits(res, params.id_user);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myReservationsCredits: function (req, res) {
    var params = req.params;

    if (params.id_user)
      Credit.MyReservationsCredits(res, params.id_user);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  allCredits: function (req, res) {
    var params = req.params;

    if (params.id_user)
      Credit.AllCredits(res, params.id_user);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

