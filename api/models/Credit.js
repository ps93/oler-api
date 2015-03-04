/**
 * Credits.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'credits',

  attributes: {
    id_user: {
      model: 'user',
      required: true
    },
    id_friend: {
      model: 'user',
      required: true
    },
    id_hotel: {
      model: 'hotel',
      required: true
    },
    id_reservation: {
      type: 'string',
      required: true
    }
  },

  InsertCredit: function (res, idUser, idHotel, idReservation) {

    var prepareParams = {
      id_hotel: idHotel,
      id_reservation: idReservation
    };

    async.series([
      // CONTROLLA SE ESISTE UN UTENTE CHE DOVREBBE GUADAGNARE
      // SU QUESTA PRENOTAZIONE
      function (callback) {
        Friend
          .findOne({id_friend: idUser, canEarnCredits: true})
          .populate('id_user')
          .exec(function (error, data) {
            if (error) callback(error);
            else if (data) {
              prepareParams.id_user = data.id_user.id;
              prepareParams.id_friend = idUser;
              callback();
            }
            else res.ok({data: 'Nessun credito da asegnare'});
          });
      },
      // SE TROVA UN UTENTE CHE PUO GUADAGNARE SU QUESTA PRENOTAZIONE
      // SALVA I DATI NELLA TABELLA CREDITS
      function (callback) {
        Credit.findOrCreate(prepareParams, prepareParams).exec(function (error, data) {
          if (error) callback(error);
          else res.ok({data: data});
        });
      }
    ], function (error) {
      if (error) res.serverError({'message': error});
    });
  },

  MyCredits: function (res, idUser) {

    Credit
      .find({id_user: idUser})
      .populate('id_friend')
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error) res.serverError({'message': error});
        else {
          var dataToShow = [];
          for (var i = 0; i < data.length; i++) {
            dataToShow.push({
              id_reservation: data[i].id_reservation,
              booking_date: data[i].createdAt,
              friend: data[i].id_friend,
              hotel: data[i].id_hotel
            });
          }
          res.ok({data: dataToShow});
        }
      });
  }

};
