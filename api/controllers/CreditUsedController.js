/**
 * CreditUsedController
 *
 * @description :: Server-side logic for managing Credituseds
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  insertCreditUsed: function (req, res) {
    var params = req.body;

    if (params.id_user
      && params.id_user.trim()
      && params.id_reservation
      && params.id_reservation.trim()
      && _.isNumber(params.credit_used))
      CreditUsed.InsertCreditUsed(res, params.id_user.trim(), params.id_reservation.trim(), params.credit_used);

    else
      res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

