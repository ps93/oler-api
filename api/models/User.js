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
      type: 'string',
      required: true
    },
    image: 'string',
    toJSON: function () {
      var obj = this.toObject();
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
            if (error) callback(error);
            else if (data) res.status(401).json({message: sails.__({phrase: 'email_is_present', locale: 'it'})});
            else callback();
          });
      },
      /****************************************************************/
      /* 2. REGISTRAZIONE DELL'UTENTE NEL DATABASE DI OLER            */
      /****************************************************************/
      function (callback) {

        passwordChiaro = params.password;

        User
          .create({
            firstname: params.firstname,
            lastname: params.lastname,
            email: params.email,
            password: MD5(params.password),
            access: params.access,
            token: params.token
          })
          .exec(function (error, data) {
            if (error) callback(error);
            else {
              userRegistered = data;
              callback();
            }
          });
      },
      /****************************************************************/
      /* 3. REGISTRAZIONE UTENTE NEL DATABASE DI HOTELNET             */
      /****************************************************************/
      function (callback) {
        callback();
        /*var requestPrepared = HotelnetService.HotelnetRegistrationPrepare('1', userRegistered, passwordChiaro);
        var options = HotelnetService.HotelnetRegistrationOptions(requestPrepared);

        var request = https.request(options, function (response) {
          response.setEncoding('utf8');

          response.on('data', function (chunk) {
            var dataFromApi = JSON.parse(chunk);
            if (dataFromApi.registration_confirmed) callback();
            else User.Remove(res, userRegistered.id);
          });
        });

        request.on('error', function (e) {
          User.Remove(res, userRegistered.id);
        });

        request.write(requestPrepared);
        request.end();*/
      },
      /****************************************************************/
      /* 4. CONTROLLA SE SONO PRESENTI PERSONE CHE ABBIANO            */
      /*    CONDIVISO L'APP CON L'UTENTE                              */
      /****************************************************************/
      function (callback) {
        delete userRegistered.password;
        delete userRegistered.token;
        delete userRegistered.access;
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
    User
      .findOne({email: email, password: MD5(password)})
      .exec(function (error, data) {
        if (error) res.serverError({message: error});
        else if (data)res.ok({data: data});
        else res.ok({'message': sails.__({phrase: 'invalid_auth', locale: 'it'})});
      });
  },

  LoginOrRegistrationWithSocial: function (res, params) {
    User
      .findOne({email: params.email})
      .exec(function (error, checkUserEmail) {
        if (error) res.serverError({data: error});
        else if (checkUserEmail) {
          User
            .update({id: checkUserEmail.id}, {image: params.image, token: params.token})
            .exec(function (error, userUpdated) {
              if (error) res.serverError({'message': error});
              else res.ok({data: userUpdated});
            });
        }
        else {
          User
            .create({
              firstname: params.firstname,
              lastname: params.lastname,
              email: params.email,
              access: params.access,
              token: params.token,
              image: params.image
            }).exec(function (error, userCreated) {
              if (error) res.serverError({'message': error});
              else {
                delete userCreated.password;
                delete userCreated.token;
                delete userCreated.access;
                res.ok({'data': userCreated});
              }
            });
        }
      });
  },

  SetPassword: function (res, email) {
    User
      .update({email: email}, {password: MD5('passwordoler')})
      .exec(function (error, passwordUpdated) {
        if (error) res.serverError({message: error});
        else if (passwordUpdated.length > 0) EmailService.SendEmailSetPassword(res, 'passwordoler', email);
        else res.status(404).json({'message': sails.__({phrase: 'email_not_exist', locale: 'it'})});
      })
  },

  Remove: function (res, idUser) {
    User
      .destroy({id: idUser})
      .exec(function (error, data) {
        if (error) res.serverError({message: error});
        else res.status(401).json({message: 'Si sono verificati dei problemi, riprovare di nuovo.'});
      });
  },

  MyProfile: function (res, idUser) {

    User
      .findOne({id: idUser})
      .exec(function (error, data) {
        if (error) res.serverError({message: error});
        else if (data) res.ok({data: data});
        else res.status(404).json({message: 'L\'utente non è stato trovato'});
      });
  }

};


