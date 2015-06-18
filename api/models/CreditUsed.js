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

  InsertCreditUsed: function (res, idUser, idReservation, creditUsed, usersAmounts) {

    async.series([

      // REGISTRA IL CREDITO UTILIZZATO
      function (callback) {
        CreditUsed
          .findOrCreate({id_user: idUser, id_reservation: idReservation}, {
            id_user: idUser, id_reservation: idReservation,
            credit_used: creditUsed
          })
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (usersAmounts && usersAmounts.length > 0) return callback();
            else return res.ok({data: data, usersAmounts: usersAmounts || []});
          });
      },

      // SINCRONIZZA CREDITI WEBSERVICES HOTELNET
      function (callback) {
        HotelnetService
          .CreditsSync(usersAmounts, idReservation,
          function (error, response) {
            if (error) res.ok({message: 'Registrato utente che ha guadagnato i punti.', error: error});
            else return res.ok({
              message: 'Registrato utente che ha guadagnato i punti.',
              usersAmounts: usersAmounts,
              response: response
            });
          });
      }

    ], function (error) {
      if (error) return res.serverError({'message': error});
    });
  }

};

