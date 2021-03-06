/**
 * CreditsController
 *
 * @description :: Server-side logic for managing credits
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insertCredit: function (req, res) {
    var params = req.body;

    if (params.id_user && params.id_user.trim()
      && params.id_hotel && params.id_hotel.trim()
      && params.id_reservation && params.id_reservation.trim()
      && _.isNumber(params.total_reservation) && params.total_reservation > 0
      && _.isNumber(params.total_paid)
      && _.isNumber(params.credit_used)
      && params.check_in && params.check_in.trim()
      && params.check_out && params.check_out.trim()
      && params.currency && params.currency.trim()) {

      Credit.InsertCredit(
        res,
        params.id_user.trim(),
        params.id_hotel.trim(),
        params.id_reservation.trim(),
        params.total_reservation,
        params.total_paid,
        params.credit_used,
        params.check_in,
        params.check_out,
        params.currency.trim()
      );

    }

    else return res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myCredits: function (req, res) {
    var params = req.params;

    if (params.id_user && params.id_user.trim())
      Credit.MyCredits(res, params.id_user.trim());

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myReservationsCredits: function (req, res) {
    var params = req.params;

    if (params.id_user && params.id_user.trim())
      Credit.MyReservationsCredits(res, params.id_user.trim());

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  updateCredits: function (req, res) {
    var params = req.body;

    if (params.reservationId && params.reservationId.trim()
      && _.isNumber(params.penalityAmount)
      && _.isArray(params.credits_from_hotelnet) && params.credits_from_hotelnet.length > 0
      && _.isNumber(params.booker_credits_repayment))
      Credit.UpdateCredits(res, params.reservationId.trim(), params.penalityAmount, params.credits_from_hotelnet, params.booker_credits_repayment);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  allCredits: function (req, res) {
    var params = req.params;

    if (params.id_user && params.id_user.trim())
      Credit.AllCredits(res, params.id_user.trim());

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

