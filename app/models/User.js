var db = require('mongoose'),
    Schema = db.Schema,
    http = require('http'),
    MD5 = require('MD5'),
    Async = require('async'),
    _ = require('underscore'),
    Utils = require('../helpers/utils'),
    ShareappModel = require('../models/Shareapp'),
    Shareapp = ShareappModel.Model();

var userSchema = new Schema({
    access: [
        {
            code: String,
            name: {type: String, enum: ['email', 'facebook', 'google'], required: true},
            token: {type: String},
            created_at: {type: Date, default: new Date()},
            updated_at: Date
        }
    ],
    email: {type: String, unique: true, required: true},
    password: String,
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    image: String,
    points: {type: Number, default: 2},
    created_at: {type: Date, default: new Date()},
    updated_at: Date
});

var User = db.model('users', userSchema);

var self = {

    Model: function () {
        return db.model('users', userSchema);
    },

    RegistrationWithEmail: function (res, params) {

        var passwordChiaro = params.password;
        params.password = MD5(params.password);
        params.access = [params.access];
        var userRegistered;
        var myNewFriends;

        Async.series([
                /****************************************************************/
                /* 1. VERIFICA CHE L'UTENTE NON SIA GIA' REGISTRATO             */
                /****************************************************************/
                function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else if (data !== null) return callback({status: 401, message: 'user_is_present'});
                            else return callback();
                        });
                },
                /****************************************************************/
                /* 2. REGISTRAZIONE DELL'UTENTE NEL DATABASE DI OLER            */
                /****************************************************************/
                function (callback) {
                    User(params)
                        .save(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else {
                                userRegistered = data;
                                return callback();
                            }
                        });
                },
                /****************************************************************/
                /* 3. REGISTRAZIONE UTENTE NEL DATABASE DI HOTELNET             */
                /****************************************************************/
                function (callback) {

                    return callback();
                    /* var requestPrepared = self.HotelnetRegistrationPrepare('1', userRegistered, passwordChiaro);
                     var options = self.HotelnetRegistrationOptions(requestPrepared);

                     var request = http.request(options, function (response) {
                     response.setEncoding('utf8');
                     response.on('data', function (chunk) {
                     var dataFromApi = JSON.parse(chunk);
                     if (dataFromApi.registration_confirmed) return callback();
                     else self.RemoveUser(res, userRegistered._id);
                     });
                     });

                     request.on('error', function (e) {
                     self.RemoveUser(res, userRegistered._id);
                     });

                     request.write(requestPrepared);
                     request.end();*/
                },
                /****************************************************************/
                /* 4. CONTROLLA SE SONO PRESENTI PERSONE CHE ABBIANO            */
                /*    CONDIVISO L'APP CON L'UTENTE                              */
                /****************************************************************/
                function (callback) {

                    var userCreated = {
                        _id: userRegistered._id,
                        firstname: userRegistered.firstname,
                        lastname: userRegistered.lastname,
                        email: userRegistered.email,
                        image: userRegistered.image,
                        points: userRegistered.points
                    };

                    Shareapp
                        .find()
                        .where('contacts.email').equals('grandemayta@gmail.com')
                        .sort('contacts.date')
                        .select('id_user')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else if (data.length > 0) {
                                UserFriendsModel.CreateFriendListOnUserRegistration(res, userCreated, data);
                            }
                            else return res.status(201).json({data: userCreated});
                        });
                }
            ],
            function (error) {
                if (error) res.status(error.status).json({error: {message: error.message}});
            });
    },

    LoginWithEmail: function (res, email, password) {

        User
            .findOne()
            .where('email').equals(email)
            .where('password').equals(MD5(password))
            .select('firstname lastname email image points updated_at')
            .exec(function (error, user) {
                if (error) res.status(500).json({error: {message: error}});
                else if (user) res.status(200).json({data: user});
                else res.status(404).json({error: {message: "Email e/o password errati!"}});
            });
    },

    LoginOrRegistrationWithSocial: function (res, params) {

        var socialAccessName = params.access.name;

        Async.parallel({
                checkEmailExist: function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .select('email access')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else return callback(null, data);
                        });
                },
                checkUserAccessDirect: function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .where('access.name').equals(params.access.name)
                        .select('access')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else return callback(null, data);
                        })
                }
            },
            function (error, responses) {
                if (error) res.status(error.status).json({error: {message: error.message}});

                else if (responses.checkEmailExist === null && responses.checkUserAccessDirect === null) {
                    params.access = [params.access];
                    User(params)
                        .save(function (error, data) {
                            if (error) res.status(500).json({error: {message: error}});
                            else {
                                var userForHotelNet = JSON.stringify({
                                    "channel_code": "0202",
                                    "id_user": data._id,
                                    "username": data.email,
                                    "email": data.email,
                                    "password": data.email,
                                    "name": data.firstname,
                                    "surname": data.lastname,
                                    "how_user_registered": socialAccessName === 'facebook' ? "1" : "2"
                                });

                                var options = {
                                    hostname: "apps.hotelnet.biz",
                                    path: "/channelmanager/hotelnetservices/api/user_new",
                                    port: 80,
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Content-Length": userForHotelNet.length
                                    }
                                };

                                var request = http.request(options, function (response) {
                                    response.setEncoding('utf8');
                                    response.on('data', function (chunk) {

                                        var dataFromApi = JSON.parse(chunk);
                                        console.log(dataFromApi);

                                        if (dataFromApi.registration_confirmed) {
                                            res.status(201).json({
                                                data: {
                                                    _id: data._id,
                                                    firstname: data.firstname,
                                                    lastname: data.lastname,
                                                    email: data.email,
                                                    image: data.image,
                                                    points: data.points
                                                }
                                            });
                                        }
                                        else {
                                            this.RemoveUser(res, data._id);
                                        }
                                    });
                                });

                                request.on('error', function (e) {
                                    this.RemoveUser(res, data._id);
                                });

                                request.write(userForHotelNet);
                                request.end();
                            }
                        });
                }
                else {
                    var access = responses.checkEmailExist.access;
                    var found = false;

                    for (var a in access) {
                        if (access[a].name === params.access.name) {
                            access[a].updated_at = new Date();
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        access.push(params.access);
                    }

                    params.access = access;

                    User
                        .findOneAndUpdate(params)
                        .where('email').equals(params.email)
                        .select('firstname lastname email points image')
                        .exec(function (error, data) {
                            if (error) res.status(500).json({error: {message: error}});
                            else res.status(200).json({data: data});
                        });
                }
            });

    },

    ChangePassword: function (res, email) {

        var password = 'olerapp';

        User
            .findOneAndUpdate({password: MD5(password), updated_at: new Date})
            .where('email').equals(email)
            .select('firstname lastname email')
            .exec(function (error, passwordChanged) {
                if (error) res.status(500).json({error: {message: error}});
                if (passwordChanged) return self.SendEmail(res, email, password);
                else res.status(404).json({error: {message: "Not found"}});
            });
    },

    SendEmail: function (res, email, password) {

        var prepareEmail = {
            from: 'Oler Srl<oler@gmail.com>',
            to: email,
            subject: "Hai chiesto di resettare la password",
            html: "<p>Password temporanea</p><br/><b>" + password + "</b>"
        };

        var config = Utils.emailConfiguration();
        config.sendMail(prepareEmail, function (error) {
            if (error) res.status(500).json({error: {message: error}});
            else res.status(200).json({data: 'La password è stata cambiata.'});
        });
    },

    RemoveUser: function (res, id) {

        User.findByIdAndRemove(id, function (error) {
            if (error) res.status(500).json({error: {message: error}});
            else res.status(200).json({error: {message: "user_deleted"}});
        });
    },

    HotelnetRegistrationPrepare: function (howUserRegistered, params, password) {
        // 1 = email | 2 = facebook | 3 = google
        return JSON.stringify({
            'channel_code': '0202',
            'id_user': params._id,
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
            hostname: 'apps.hotelnet.biz',
            path: '/channelmanager/hotelnetservices/api/user_new',
            port: 80,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': requestPrepared.length
            }
        };
    }

};

module.exports = self;