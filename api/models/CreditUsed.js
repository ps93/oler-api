/**
 * CreditUsed.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'creditsused',

  attributes: {
    id_user: {
      model: 'user',
      required: true
    },
    id_reservation: {
      type: 'string',
      required: true
    },
    credit_used: {
      type: 'float',
      required: true
    }
  },

  InsertCreditUsed: function (res, idUser, idReservation, creditUsed) {

    CreditUsed
      .findOrCreate({
        id_user: idUser,
        id_reservation: idReservation
      }, {
        id_user: idUser,
        id_reservation: idReservation,
        credit_used: creditUsed
      })
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else return res.ok({data: data});
      });

  }

};

