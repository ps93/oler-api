var https = require('https');

module.exports = {

  HotelnetRegistrationPrepare: function (howUserRegistered, params, password) {
    // 1 = email | 2 = facebook | 3 = google
    return JSON.stringify({
      'channel_code': '0202',
      'user_id': params.id,
      'language': 'it',
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
      path: '/ws/Hotelnet.Services.Sandbox/api/user_new',
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
      'earner_user_id': earnerUserId,
      'user_id': idUser
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services.Sandbox/api/User_Earning_Relation',
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
        if (dataFromApi && dataFromApi.operation_confimerd) return callback(null, dataFromApi);
        return callback(dataFromApi);
      });
    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();
  },

  CreditsSync: function (usersAmounts, reservationCode, callback) {
    var requestPrepared = JSON.stringify({
      'channel_code': '0202',
      // ARRAY DI UTENTI CON I RISPETTVI CREDITI
      'users_amounts': usersAmounts,
      'reservation_type': '0',
      'reservation_code': reservationCode
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services.Sandbox/api/booking_credits',
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
        if (dataFromApi && dataFromApi.credits_confirmed) return callback(null, dataFromApi);
        return callback(dataFromApi);
      });
    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();
  },

  ModifyUserSync: function (userId, firstname, lastname, phone, street_address, city, zipcode, country, callback) {
    var requestPrepared = JSON.stringify({
      channel_code: '0202',
      user_id: userId,
      language: 'it',
      first_name: firstname,
      last_name: lastname,
      phone_number: _.isEmpty(phone) ? '' : phone,
      address: {
        street: _.isEmpty(street_address) ? '' : street_address,
        city: _.isEmpty(city) ? '' : city,
        postal_code: _.isEmpty(zipcode) ? '' : zipcode,
        country: _.isEmpty(country) ? '' : country
      }
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services.Sandbox/api/user_update_profile',
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

        if (response.statusCode === 200 && dataFromApi.operation_confimerd) {
          return callback(null, dataFromApi);
        }
        else return callback(dataFromApi);
      });

    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();
  },

  PasswordSync: function (userId, oldPassword, newPassword, callback) {
    var requestPrepared = JSON.stringify({
      channel_code: '0202',
      language: 'it',
      user_id: userId,
      old_password: oldPassword,
      new_password: newPassword
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services.Sandbox/api/user_change_password',
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

        if (response.statusCode === 200 && dataFromApi.operation_confimerd) {
          return callback(null, dataFromApi);
        }
        else return callback(dataFromApi);
      });

    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();
  },

  ResetPasswordSync: function (email, securityCode, password, callback) {
    var requestPrepared = JSON.stringify({
      channel_code: '0202',
      language: 'it',
      username: email,
      security_code: securityCode,
      only_generate_code: false,
      new_password: password
    });

    var options = {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services.Sandbox/api/user_reset_password',
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

        if (response.statusCode === 200 && dataFromApi.password_set_correctly) {
          return callback(null, true);
        }
        else if (response.statusCode === 200 && !dataFromApi.password_set_correctly) {
          return callback(null, false);
        }
        else return callback(dataFromApi);
      });

    });

    request.on('error', function (e) {
      return callback(e);
    });

    request.write(requestPrepared);
    request.end();

  },

  CalculateCredits: function (total, percentage) {
    return (Math.round(total * percentage) / 100);
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
            if (item.reservation_date && new Date(item.reservation_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
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
