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
    total_reservation: {
      type: 'float',
      required: true
    },
    reservation_date: {
      type: 'date',
      required: true
    },
    currency: {
      type: 'string',
      required: true
    },
    level: {
      type: 'string',
      // 1. Io
      // 2. Amico Primo Livello
      // 3. Amico Secondo Livello
      enum: ["0", "1", "2"],
      required: true
    },
    percentage: {
      type: 'float',
      required: true
    },
    credits: {
      type: 'float',
      required: true
    },
    toJSON: function () {
      var obj = this.toObject();
      obj.friend = obj.id_friend;
      obj.hotel = obj.id_hotel;
      delete obj.id_friend;
      delete  obj.id_hotel;
      return obj;
    }
  },

  InsertCredit: function (res, idUser, idHotel, idReservation, totalReservation, reservationDate, currency) {

    var prepareParams = [];
    var firstLevelFound = false;
    var secondLevelFound = false;

    async.series([
      // CONTROLLA AMICO LIVELLO 1
      function (callback) {
        Friend
          .findOne({id_friend: idUser, can_earn_credits: true})
          .populate('id_user')
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data) {
              var getCredit = HotelnetService.CalculateCredits(totalReservation, 2);
              prepareParams.push({
                id_user: data.id_user.id,
                id_friend: idUser,
                id_hotel: idHotel,
                id_reservation: idReservation,
                total_reservation: totalReservation,
                reservation_date: reservationDate,
                currency: currency,
                level: 1,
                percentage: 2,
                credits: getCredit
              });
              firstLevelFound = true;
              return callback();
            }
            else return callback();
          });
      },

      //CONTROLLA AMICO LIVELLO 2
      function (callback) {
        if (firstLevelFound) {
          Friend
            .findOne({id_friend: prepareParams[0].id_user, can_earn_credits: true})
            .populate('id_user')
            .exec(function (error, data) {
              if (error) return callback(error);
              else if (data) {
                var getCredit = HotelnetService.CalculateCredits(totalReservation, 1);
                prepareParams.push({
                  id_user: data.id_user.id,
                  id_friend: idUser,
                  id_hotel: idHotel,
                  id_reservation: idReservation,
                  total_reservation: totalReservation,
                  reservation_date: reservationDate,
                  currency: currency,
                  level: 2,
                  percentage: 1,
                  credits: getCredit
                });
                secondLevelFound = true;
                return callback();
              }
              else return callback();
            });
        }
        else return callback();
      },

      // SALVA IL CREDITO DELL'UTENTE CHE HA FATTO LA PRENOTAZIONE
      function (callback) {

        var getCredit = HotelnetService.CalculateCredits(totalReservation, 2);

        Credit
          .findOrCreate({
            id_user: idUser,
            id_friend: idUser,
            id_hotel: idHotel,
            id_reservation: idReservation
          },
          {
            id_user: idUser,
            id_friend: idUser,
            id_hotel: idHotel,
            id_reservation: idReservation,
            total_reservation: totalReservation,
            reservation_date: reservationDate,
            currency: currency,
            level: 0,
            percentage: 2,
            credits: getCredit
          })
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (firstLevelFound) return callback();
            else return res.ok({message: 'Registrato utente che ha guadagnato i punti.'});
          });

      },

      // SE TROVA UN UTENTE DI LIVELLO 1 CHE PUO' GUADAGNARE SU QUESTA PRENOTAZIONE
      // SALVA I DATI NELLA TABELLA CREDITS
      function (callback) {
        Credit
          .findOrCreate({
            id_user: prepareParams[0].id_user,
            id_friend: prepareParams[0].id_friend,
            id_hotel: idHotel,
            id_reservation: idReservation
          }, prepareParams[0])
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (secondLevelFound) return callback();
            else return res.ok({message: 'Registrato utente che ha guadagnato i punti.'});
          });
      },

      // SE TROVA UN UTENTE DI LIVELLO 2 CHE PUO' GUADAGNARE SU QUESTA PRENOTAZIONE
      // SALVA I DATI NELLA TABELLA CREDITS
      function (callback) {
        Credit
          .findOrCreate({
            id_user: prepareParams[1].id_user,
            id_friend: prepareParams[1].id_friend,
            id_hotel: idHotel,
            id_reservation: idReservation
          }, prepareParams[1])
          .exec(function (error, data) {
            if (error) return callback(error);
            else return res.ok({message: 'Registrato gli utenti che hanno guadagnato i punti.'});
          });
      }
    ], function (error) {
      if (error) return res.serverError({'message': error});
    });
  },

  MyCredits: function (res, idUser) {

    Credit
      .find({
        id_user: idUser,
        level: {'!': "0"},
        sort: 'reservation_date'
      })
      .populate('id_friend')
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else return res.ok({data: data});
      });
  },

  MyReservationsCredits: function(res, idUser) {

    Credit
      .find({
        id_user: idUser,
        level: "0",
        sort: 'reservation_date'
      })
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else return res.ok({data: data});
      });
  },


  AllCredits: function(res, idUser) {

    Credit
      .find({
        id_user: idUser,
        sort: 'reservation_date'
      })
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else return res.ok({data: data});
      });
  }

};

