/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var MD5 = require('MD5'),
  https = require('https');

module.exports = {

  tableName: 'users',

  attributes: {

    firstname: {
      type: 'string',
      required: true
    },
    lastname: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      unique: true,
      required: true
    },
    password: {
      type: 'string',
      minLength: 8
    },
    access: {
      type: 'string',
      enum: ['facebook', 'google', 'email'],
      required: true
    },
    token: {
      type: 'array',
      required: true
    },
    image: 'string',
    toJSON: function () {
      var obj = this.toObject();
      obj.fullname = obj.firstname + ' ' + obj.lastname;
      delete obj.password;
      delete obj.access;
      delete obj.token;
      return obj;
    }
  },

  RegistrationWithEmail: function (res, params) {

    var userRegistered;
    var passwordChiaro;

    async.series([
      /****************************************************************/
      /* 1. VERIFICA CHE L'UTENTE NON SIA GIA' REGISTRATO             */
      /****************************************************************/
      function (callback) {
        User
          .findOne({email: params.email})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data) return res.status(401).json({message: sails.__({phrase: 'email_is_present', locale: 'it'})});
            else return callback();
          });
      },
      /****************************************************************/
      /* 2. REGISTRAZIONE DELL'UTENTE NEL DATABASE DI OLER            */
      /****************************************************************/
      function (callback) {

        passwordChiaro = params.password;
        var getToken = SecurityManager.TokenGenerator(params.email);

        User
          .create({
            firstname: params.firstname,
            lastname: params.lastname,
            email: params.email,
            password: MD5(params.password),
            access: params.access,
            token: [getToken]
          })
          .exec(function (error, data) {
            if (error) callback(error);
            else {
              data.accesstoken = getToken;
              userRegistered = data;
              return callback();
            }
          });
      },
      /****************************************************************/
      /* 3. REGISTRAZIONE UTENTE NEL DATABASE DI HOTELNET             */
      /****************************************************************/
      function (callback) {
        var requestPrepared = HotelnetService.HotelnetRegistrationPrepare('1', userRegistered, passwordChiaro);
        var options = HotelnetService.HotelnetRegistrationOptions(requestPrepared);

        var request = https.request(options, function (response) {
          response.setEncoding('utf8');

          response.on('data', function (chunk) {
            var dataFromApi = JSON.parse(chunk);
            if (dataFromApi.registration_confirmed) return callback();
            else User.Remove(res, userRegistered.id);
          });
        });

        request.on('error', function (e) {
          User.Remove(res, userRegistered.id);
        });

        request.write(requestPrepared);
        request.end();
      },
      /****************************************************************/
      /* 4. CONTROLLA SE SONO PRESENTI PERSONE CHE ABBIANO            */
      /*    CONDIVISO L'APP CON L'UTENTE                              */
      /****************************************************************/
      function (callback) {
        Shareapp
          .find({contact: userRegistered.email, sort: 'createdAt'})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) Friend.InsertFriendsOnUserRegistration(res, userRegistered, data);
            else return res.ok({data: userRegistered});
          });
      }
    ], function (error) {
      if (error) res.serverError({'message': error});
    });
  },

  LoginWithEmail: function (res, email, password) {

    var userFound = {};
    var tokens = [];

    async.series([
      function (callback) {
        User
          .findOne({email: email, password: MD5(password)})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (!_.isEmpty(data)) {
              userFound = data;
              tokens = data.token || [];
              return callback();
            }
            else return res.ok({'message': sails.__({phrase: 'invalid_auth', locale: 'it'})});
          });
      },
      function (callback) {

        var getToken = SecurityManager.TokenGenerator(userFound.email);
        tokens.push(getToken);

        User
          .update({id: userFound.id}, {token: tokens})
          .exec(function (error, data) {
            if (error) return callback(error);
            else {
              data[0].accesstoken = getToken;
              return res.ok({data: data[0]});
            }
          });
      }
    ], function (error) {
      if (error) res.serverError({'message': error});
    });

  },

  LoginOrRegistrationWithSocial: function (res, params) {

    var userRegistered;
    var passwordChiaro;

    async.series([
      /****************************************************************/
      /* 1. VERIFICA CHE L'UTENTE NON SIA GIA' REGISTRATO             */
      /****************************************************************/
      function (callback) {
        var tokens = [];

        User
          .findOne({email: params.email})
          .exec(function (error, checkUserEmail) {
            if (error) return callback(error);
            else if (checkUserEmail) {
              tokens = checkUserEmail.token || [];
              var getToken = SecurityManager.TokenGenerator(params.email);
              tokens.push(getToken);
              User
                .update({id: checkUserEmail.id}, {
                    access: params.access,
                    image: params.image, 
                    token: tokens
                  })
                .exec(function (error, userUpdated) {
                  if (error) return res.serverError({'message': error});
                  else {
                    userUpdated[0].accesstoken = getToken;
                    return res.ok({data: userUpdated[0]});
                  }
                });
            }
            else return callback();
          });
      },
      /****************************************************************/
      /* 2. REGISTRAZIONE DELL'UTENTE NEL DATABASE DI OLER            */
      /****************************************************************/
      function (callback) {

        var getToken = SecurityManager.TokenGenerator(params.email);

        User
          .create({
            firstname: params.firstname,
            lastname: params.lastname,
            email: params.email,
            access: params.access,
            token: [getToken]
          })
          .exec(function (error, data) {
            if (error) callback(error);
            else {
              data.accesstoken = getToken;
              userRegistered = data;
              return callback();
            }
          });
      },
      /****************************************************************/
      /* 3. REGISTRAZIONE UTENTE NEL DATABASE DI HOTELNET             */
      /****************************************************************/
      function (callback) {
        var requestPrepared = HotelnetService.HotelnetRegistrationPrepare('1', userRegistered, userRegistered.email);
        var options = HotelnetService.HotelnetRegistrationOptions(requestPrepared);

        var request = https.request(options, function (response) {
          response.setEncoding('utf8');

          response.on('data', function (chunk) {
            var dataFromApi = JSON.parse(chunk);
            if (dataFromApi.registration_confirmed) return callback();
            else User.Remove(res, userRegistered.id);
          });
        });

        request.on('error', function (e) {
          User.Remove(res, userRegistered.id);
        });

        request.write(requestPrepared);
        request.end();
      },
      /****************************************************************/
      /* 4. CONTROLLA SE SONO PRESENTI PERSONE CHE ABBIANO            */
      /*    CONDIVISO L'APP CON L'UTENTE                              */
      /****************************************************************/
      function (callback) {
        Shareapp
          .find({contact: userRegistered.email, sort: 'createdAt'})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) Friend.InsertFriendsOnUserRegistration(res, userRegistered, data);
            else return res.ok({data: userRegistered});
          });
      }
    ], function (error) {
      if (error) res.serverError({'message': error});
    });

  },

  SetPassword: function (res, email) {
    User
      .update({email: email}, {password: MD5('passwordoler')})
      .exec(function (error, passwordUpdated) {
        if (error) return res.serverError({message: error});
        else if (passwordUpdated.length > 0) EmailService.SendEmailSetPassword(res, 'passwordoler', email);
        else return res.status(404).json({'message': sails.__({phrase: 'email_not_exist', locale: 'it'})});
      })
  },

  MyProfile: function (res, idUser) {

    User
      .findOne({id: idUser})
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else if (data) return res.ok({data: data});
        else return res.status(404).json({message: 'L\'utente non è stato trovato'});
      });
  }

};


