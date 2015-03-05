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
    },
    level: {
      type: 'integer',
      required: true
    }
  },

  InsertCredit: function (res, idUser, idHotel, idReservation) {

    var prepareParams = [];
    var _1LevelFound = false;
    var _2LevelFound = false;

    async.series([
      // CONTROLLA AMICO LIVELLO 1
      function (callback) {
        Friend
          .findOne({id_friend: idUser, can_earn_credits: true})
          .populate('id_user')
          .exec(function (error, data) {
            if (error) callback(error);
            else if (data) {
              prepareParams.push({
                id_user: data.id_user.id,
                id_friend: idUser,
                level: 1,
                id_hotel: idHotel,
                id_reservation: idReservation
              });
              callback();
            }
            else res.ok({message: 'Nessun credito disponibile su questa prenotazione'});
          });
      },

      //CONTROLLA AMICO LIVELLO 2
      function (callback) {
        Friend
          .findOne({id_friend: prepareParams[0].id_user, can_earn_credits: true})
          .populate('id_user')
          .exec(function (error, data) {
            if (error) callback(error);
            else if (data) {
              prepareParams.push({
                id_user: data.id_user.id,
                id_friend: idUser,
                level: 2,
                id_hotel: idHotel,
                id_reservation: idReservation
              });
              callback();
            }
            else callback();
          });
      },

      // SE TROVA UN UTENTE DI LIVELLO 1 CHE PUO' GUADAGNARE SU QUESTA PRENOTAZIONE
      // SALVA I DATI NELLA TABELLA CREDITS
      function (callback) {
        Credit
          .findOrCreate({
            id_user: prepareParams[0].id_user,
            id_friend: prepareParams[0].id_friend,
            id_hotel: prepareParams[0].id_hotel,
            id_reservation: idReservation
          }, prepareParams)
          .exec(function (error, data) {
            if (error) callback(error);
            else if (prepareParams.length > 1) callback();
            else res.ok({message: 'Registrato utente che ha guadagnato i punti.'});
          });
      },

      // SE TROVA UN UTENTE DI LIVELLO 2 CHE PUO' GUADAGNARE SU QUESTA PRENOTAZIONE
      // SALVA I DATI NELLA TABELLA CREDITS
      function (callback) {
        Credit
          .findOrCreate({
            id_user: prepareParams[0].id_user,
            id_friend: prepareParams[0].id_friend,
            id_hotel: prepareParams[0].id_hotel,
            id_reservation: idReservation
          }, prepareParams)
          .exec(function (error, data) {
            if (error) callback(error);
            else res.ok({message: 'Registrato gli utenti che hanno guadagnato i punti.'});
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
              level: data[i].level,
              friend: data[i].id_friend,
              hotel: data[i].id_hotel
            });
          }
          res.ok({data: dataToShow});
        }
      });
  }

};

