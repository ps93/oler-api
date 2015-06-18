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
    total_paid: {
      type: 'float',
      required: true
    },
    check_in: {
      type: 'date',
      required: true
    },
    check_out: {
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
    status: {
      type: 'string',
      // A. Prenotazione Confermata
      // C. Prenotazione Cancellata
      enum: ["A", "C"],
      defaultsTo: 'A'
    },
    penalityAmount: 'float',
    toJSON: function () {
      var obj = this.toObject();
      obj.friend = obj.id_friend;
      obj.hotel = obj.id_hotel;
      delete obj.id_friend;
      delete  obj.id_hotel;
      return obj;
    }
  },

  InsertCredit: function (res, idUser, idHotel, idReservation, totalReservation, totalPaid, creditUsed, checkIn, checkOut, currency) {

    var prepareParams = [];
    var firstLevelFound = false;
    var secondLevelFound = false;
    var usersAmounts = [];

    async.series([

      // CONTROLLA CHE L'UTENTE ABBIA A DISPOSIZIONE I CREDITI
      // CHE STA USANDO NELLA PRENOTAZIONE
      function (callback) {
        if (creditUsed > 0) {
          HotelnetService
            .CheckIfUserCanUseCredits(idUser,
            function (error, creditCanUse) {
              if (error) return res.serverError({'message': error});
              else if (creditCanUse >= creditUsed) return callback();
              else return res.status(401).json({message: 'I crediti che vuoi usare non sono disponibili'});
            });
        }
        else return callback();
      },

      // CONTROLLA AMICO LIVELLO 1
      function (callback) {
        Friend
          .findOne({id_friend: idUser, can_earn_credits: true})
          .populate('id_user')
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data) {
              var getCredit = HotelnetService.CalculateCredits(totalPaid, 2);
              prepareParams.push({
                id_user: data.id_user.id,
                id_friend: idUser,
                id_hotel: idHotel,
                id_reservation: idReservation,
                check_in: checkIn,
                check_out: checkOut,
                total_paid: totalPaid,
                currency: currency,
                level: 1,
                percentage: 2,
                credits: getCredit
              });

              usersAmounts.push({
                user_id: data.id_user.id,
                user_level: 1,
                amount: getCredit
              });

              firstLevelFound = true;
              return callback();
            }
            else return callback();
          });
      },

      // CONTROLLA AMICO LIVELLO 2
      function (callback) {
        if (firstLevelFound) {
          Friend
            .findOne({id_friend: prepareParams[0].id_user, can_earn_credits: true})
            .populate('id_user')
            .exec(function (error, data) {
              if (error) return callback(error);
              else if (data) {
                var getCredit = HotelnetService.CalculateCredits(totalPaid, 1);
                prepareParams.push({
                  id_user: data.id_user.id,
                  id_friend: idUser,
                  id_hotel: idHotel,
                  id_reservation: idReservation,
                  total_reservation: totalReservation,
                  total_paid: totalPaid,
                  check_in: checkIn,
                  check_out: checkOut,
                  currency: currency,
                  level: 2,
                  percentage: 1,
                  credits: getCredit
                });

                usersAmounts.push({
                  user_id: data.id_user.id,
                  user_level: 2,
                  amount: getCredit
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

        var getCredit = HotelnetService.CalculateCredits(totalPaid, 2);

        usersAmounts.push({
          user_id: idUser,
          user_level: 0,
          amount: getCredit
        });

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
            total_paid: totalPaid,
            check_in: checkIn,
            check_out: checkOut,
            currency: currency,
            level: 0,
            percentage: 2,
            credits: getCredit
          })
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (firstLevelFound) return callback();
            else if (!firstLevelFound && creditUsed > 0) CreditUsed.InsertCreditUsed(res, idUser, idReservation, creditUsed, usersAmounts);
            else {
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
            else if (!secondLevelFound && creditUsed > 0) CreditUsed.InsertCreditUsed(res, idUser, idReservation, creditUsed, usersAmounts);
            else {
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
            else if (creditUsed > 0) CreditUsed.InsertCreditUsed(res, idUser, idReservation, creditUsed, usersAmounts);
            else {
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
          });
      }
    ], function (error) {
      if (error) return res.serverError({'message': error});
    });

  },

  UpdateCredits: function (res, reservationId, penalityAmount, creditsFromHotelnet, bookerCreditsRepayment) {
    var prepareRequest = [];
    var prepareData = [];
    var creditsData = [];

    async.series([
        // RICALCOLO DEL CREDITO DI TUTTI GLI UTENTI
        // IN BASE ALL'ID DELLA PRENOTAZIONE
        function (callback) {
          Credit
            .find({id_reservation: reservationId})
            .exec(function (error, data) {
              if (error) return callback(error);
              else if (data.length > 0 && (creditsFromHotelnet.length === data.length)) {
                var countCreditsFound = 0;

                for (var i = 0; i < data.length; i++) {
                  var updateCredit = HotelnetService.CalculateCredits(penalityAmount, data[i].percentage);
                  var checkCredits = _.where(creditsFromHotelnet, {
                    user_level: parseInt(data[i].level),
                    amount: updateCredit
                  });

                  if (checkCredits.length > 0) countCreditsFound++;

                  prepareRequest.push({id: data[i].id});
                  prepareData.push({
                    credits: updateCredit,
                    status: 'C',
                    penalityAmount: penalityAmount
                  });
                }
                if (countCreditsFound === prepareData.length) return callback();
                else return callback("Si sono verificati degli errori durante l'aggiornamento dei crediti");
              }
              else return callback("Si sono verificati degli errori durante l'aggiornamento dei crediti");
            });
        },
        // AGGIORNAMENTO DEL CREDITO RIGA 1
        function (callback) {
          Credit
            .update(prepareRequest[0], prepareData[0])
            .exec(function (error, data) {
              if (error) return callback(error);
              else {
                creditsData.push(data[0]);
                if (prepareRequest.length > 1) return callback();
                else return res.ok({data: creditsData});
              }
            });
        },
        // AGGIORNAMENTO DEL CREDITO RIGA 2
        function (callback) {
          Credit
            .update(prepareRequest[1], prepareData[1])
            .exec(function (error, data) {
              if (error) return callback(error);
              else {
                creditsData.push(data[0]);
                if (prepareRequest.length > 2) return callback();
                else return res.ok({data: creditsData});
              }
            });
        },
        // AGGIORNAMENTO DEL CREDITO RIGA 3
        function (callback) {
          Credit
            .update(prepareRequest[2], prepareData[2])
            .exec(function (error, data) {
              if (error) return callback(error);
              else {
                creditsData.push(data[0]);
                return res.ok({data: creditsData});
              }
            });
        }
      ],
      function (error) {
        if (error) return res.serverError({message: error});
      }
    );
  },

  // CREDITI GUADAGNATI SULLA PRENOTAZIONE DEI MIEI AMICI
  MyCredits: function (res, idUser) {

    async.parallel([
      // TUTTI I CREDITI
      function (callback) {
        Credit
          .find({
            id_user: idUser,
            level: {'!': "0"},
            sort: 'check_in'
          })
          .populate('id_friend')
          .populate('id_hotel')
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      },
      // CREDITI UTILIZZATI
      function (callback) {
        CreditUsed
          .find({id_user: idUser})
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      }
    ], function (error, responses) {
      if (error) return res.serverError({'message': error});
      else {
        var totalCredits = 0;
        var creditsActual = 0;
        var creditsPending = 0;
        var creditsUsed = 0;
        var reservations = [];

        if (responses[0].length > 0) {
          _.forEach(responses[0], function (item) {
            totalCredits += item.credits;
            if (item.check_out
              && (new Date(item.check_out).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
              item.hasCredits = true;
              reservations.push(item);
              creditsActual += item.credits;
            }
            else {
              item.hasCredits = false;
              reservations.push(item);
              creditsPending += item.credits;
            }
          });
        }
        if (responses[1].length > 0) {
          _.forEach(responses[1], function (item) {
            creditsUsed += item.credit_used;
          });

          creditsActual = creditsUsed > creditsActual ? 0 : creditsActual;
        }

        return res.ok({
          data: {
            totalCredits: totalCredits,
            creditsActual: creditsActual,
            creditsPending: creditsPending,
            creditsUsed: creditsUsed,
            reservations: reservations
          }
        });
      }
    });

  },

  //CREDITI GUADAGNATI SULLE MIE PRENOTAZIONI
  MyReservationsCredits: function (res, idUser) {

    async.parallel([
      // TUTTI I CREDITI
      function (callback) {
        Credit
          .find({
            id_user: idUser,
            level: "0",
            sort: 'check_out'
          })
          .populate('id_hotel')
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      },
      // CREDITI UTILIZZATI
      function (callback) {
        CreditUsed
          .find({id_user: idUser})
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      }
    ], function (error, responses) {
      if (error) return res.serverError({'message': error});
      else {
        var totalCredits = 0;
        var creditsActual = 0;
        var creditsPending = 0;
        var creditsUsed = 0;
        var reservations = [];

        if (responses[0].length > 0) {
          _.forEach(responses[0], function (item) {
            totalCredits += item.credits;
            if (item.check_out
              && (new Date(item.check_out).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
              reservations.hasCredits = true;
              reservations.push(item);
              creditsActual += item.credits;
            }
            else {
              reservations.hasCredits = false;
              reservations.push(item);
              creditsPending += item.credits;
            }
          });
        }
        if (responses[1].length > 0) {
          _.forEach(responses[1], function (item) {
            creditsUsed += item.credit_used;
          });

          creditsActual = creditsUsed > creditsActual ? 0 : creditsActual;
        }

        return res.ok({
          data: {
            totalCredits: totalCredits,
            creditsActual: creditsActual,
            creditsPending: creditsPending,
            creditsUsed: creditsUsed,
            reservations: reservations
          }
        });
      }
    });

  },

  AllCredits: function (res, idUser) {

    async.parallel([
      // TUTTI I CREDITI
      function (callback) {
        Credit
          .find({
            id_user: idUser,
            sort: 'check_in'
          })
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      },
      // CREDITI UTILIZZATI
      function (callback) {
        CreditUsed
          .find({id_user: idUser})
          .exec(function (error, data) {
            if (error) return callback(error);
            else return callback(null, data);
          });
      }
    ], function (error, responses) {
      if (error) return res.serverError({'message': error});
      else {
        var totalCredits = 0;
        var creditsActual = 0;
        var creditsPending = 0;
        var creditsUsed = 0;
        var reservations = [];

        if (responses[0].length > 0) {
          _.forEach(responses[0], function (item) {
            totalCredits += item.credits;
            if (item.check_out
              && (new Date(item.check_out).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))) {
              reservations.hasCredits = true;
              reservations.push(item);
              creditsActual += item.credits;
            }
            else {
              reservations.hasCredits = false;
              reservations.push(item);
              creditsPending += item.credits;
            }
          });
        }
        if (responses[1].length > 0) {
          _.forEach(responses[1], function (item) {
            creditsUsed += item.credit_used;
          });
          creditsActual -= creditsUsed;
        }

        return res.ok({
          data: {
            totalCredits: totalCredits,
            creditsActual: creditsActual,
            creditsPending: creditsPending,
            creditsUsed: creditsUsed,
            reservations: reservations
          }
        });
      }
    });

  }

};

