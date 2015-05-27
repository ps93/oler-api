var https = require('https');

module.exports = {

  HotelnetRegistrationPrepare: function (howUserRegistered, params, password) {
    // 1 = email | 2 = facebook | 3 = google
    return JSON.stringify({
      'channel_code': '0202',
      'id_user': params.id,
      'username': params.email,
      'email': params.email,
      'password': password,
      'name': params.firstname,
      'surname': params.lastname,
      'how_user_registered': howUserRegistered
    });
  },

  HotelnetRegistrationOptions: function (requestPrepared) {
    return {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services/api/user_new',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestPrepared.length
      }
    };
  },

  FriendsSync: function (earnerUserId, idUser, callback) {
    var requestPrepared = JSON.stringify({
      'channel_code': '0202',
      'id_earner_user': earnerUserId,
      'id_user': idUser
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services/api/User_Earning_Relation',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestPrepared.length
      }
    };

    var request = https.request(options, function (response) {
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        var dataFromApi = JSON.parse(chunk);
        if(dataFromApi && dataFromApi.registration_confirmed) return callback(null, dataFromApi);
        return callback(dataFromApi);
      });
    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();
  },

  CalculateCredits: function (total, percentage) {
    return (total * percentage) / 100;
  },

  CheckIfUserCanUseCredits: function (idUser, callbackMain) {
    var creditsActual = 0;
    var creditsUsed = 0;

    async.parallel([
      // TUTTI I CREDITI
      function (callback) {
        Credit
          .find({id_user: idUser, sort: 'reservation_date'})
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
      if (error) return callbackMain(error);
      else {
        if (responses[0].length > 0) {
          _.forEach(responses[0], function (item) {
            if (item.reservation_date && new Date(item.reservation_date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)) {
              creditsActual += item.credits;
            }
          });
        }
        if (responses[1].length > 0) {
          _.forEach(responses[1], function (item) {
            creditsUsed += item.credit_used;
          });
          creditsActual -= creditsUsed;
        }
        callbackMain(null, creditsActual);
      }
    });
  }

};
