var http = require('http'),
    MD5 = require('MD5'),
    Async = require('async'),
    _ = require('underscore'),
    User = require('../models/usersModel'),
    Utils = require('../helpers/utils');

exports.registrationWithEmail = function (req, res) {

    var fields = ['email', 'password', 'firstname', 'lastname', 'access.name'];
    var params = req.body;

    if (Utils.validateFields(fields, params)
        && params.access
        && params.access.name === 'email') {

        var passwordChiaro = params.password;
        params.password = MD5(params.password);
        params.access = [params.access];

        Async.series({
                checkEmailExist: function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) {
                                return callback({status: 500, message: error});
                            }
                            else if (data !== null) {
                                return callback({status: 401, message: "user_is_present"});
                            }
                            else {
                                return callback();
                            }
                        });
                },
                insertUser: function (callback) {
                    User(params)
                        .save(function (error, data) {
                            if (error) {
                                return callback({status: 500, message: error});
                            }
                            else {
                                var userForHotelNet = JSON.stringify({
                                    "channel_code": "0202",
                                    "id_user": data._id,
                                    "username": data.email,
                                    "email": data.email,
                                    "password": passwordChiaro,
                                    "name": data.firstname,
                                    "surname": data.lastname,
                                    "how_user_registered": "1"
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

                                        if (dataFromApi.registration_confirmed) {
                                            return callback(null, {
                                                _id: data._id,
                                                firstname: data.firstname,
                                                lastname: data.lastname,
                                                email: data.email,
                                                image: data.image,
                                                points: data.points
                                            });
                                        }
                                        else {
                                            deleteUserById(res, data._id);
                                        }
                                    });
                                });

                                request.on('error', function (e) {
                                    deleteUserById(res, data._id);
                                });

                                request.write(userForHotelNet);
                                request.end();
                            }
                        });
                }
            },
            function (error, responses) {
                if (error) {
                    res.status(error.status).json({error: {message: error.message}});
                }
                else {
                    res.status(201).json({data: responses.insertUser});
                }
            });
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }
};

exports.loginWithEmail = function (request, response) {

    var fields = ['email', 'password'];
    var params = request.body;

    if (Utils.validateFields(fields, params)) {

        params.password = MD5(params.password);
        params.updated_at = new Date();

        User
            .findOne()
            .where('email').equals(params.email)
            .where('password').equals(params.password)
            .select('firstname lastname email image points updated_at')
            .exec(function (error, user) {
                if (error)
                    response.status(500).json({error: {message: error}});
                else if (user) {
                    response.status(200).json({data: user});
                }
                else {
                    response.status(404).json({error: {message: "Email e/o password errati!"}});
                }
            });
    }
    else {
        response.status(400).json({error: {message: "Bad request"}});
    }
};

exports.accessWithSocial = function (req, res) {

    var fields = ['email', 'firstname', 'lastname', 'access.code', 'access.name', 'access.token'];
    var params = req.body;

    if (Utils.validateFields(fields, params)
        && !params.hasOwnProperty('password')
        && (params.access.name == 'facebook'
        || params.access.name === 'google')) {

        var socialAccessName = params.access.name;

        Async.parallel({
                checkEmailExist: function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .select('email access')
                        .exec(function (error, data) {
                            if (error) {
                                return callback({status: 500, message: error});
                            }
                            else {
                                return callback(null, data);
                            }
                        });
                },
                checkUserAccessDirect: function (callback) {
                    User
                        .findOne()
                        .where('email').equals(params.email)
                        .where('access.name').equals(params.access.name)
                        .select('access')
                        .exec(function (error, data) {
                            if (error) {
                                return callback({status: 500, message: error});
                            }
                            callback(null, data);
                        })
                }
            },
            function (error, responses) {
                if (error) {
                    res.status(error.status).json({error: {message: error.message}});
                }
                else if (responses.checkEmailExist === null && responses.checkUserAccessDirect === null) {
                    params.access = [params.access];
                    User(params)
                        .save(function (error, data) {
                            if (error) {
                                res.status(500).json({error: {message: error}});
                            }
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
                                            deleteUserById(res, data._id);
                                        }
                                    });
                                });

                                request.on('error', function (e) {
                                    deleteUserById(res, data._id);
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
                            if (error) {
                                res.status(500).json({error: {message: error}});
                            }
                            else {
                                res.status(200).json({data: data});
                            }
                        });
                }
            });
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }
};

exports.setPassword = function (request, response) {

    var fields = ['email'];
    var params = request.body;

    if (Utils.validateFields(fields, params)) {

        var tempPassword = 'nello';
        params.password = MD5(tempPassword);
        params.updated_at = new Date();

        User
            .findOneAndUpdate(params)
            .where('email').equals(params.email)
            .select('firstname lastname email')
            .exec()
            .then(
            function (userModified) {
                if (userModified) {
                    return sendEmail(tempPassword, userModified, response);
                }
                else {
                    response.status(404).json({error: {message: "Not found"}});
                }
            },
            function (error) {
                response.status(500).json({error: {message: error}});
            });

    }
    else {
        response.status(400).json({error: {message: "Bad request"}});
    }
};

function sendEmail(password, params, response) {

    var prepareEmail = {
        from: 'Oler Srl<oler@gmail.com>',
        to: params.email,
        subject: "Hai chiesto di resettare la password",
        html: "<p>Password temporanea</p><br/><b>" + password + "</b>"
    };

    var config = Utils.emailConfiguration();

    config.sendMail(prepareEmail, function (error, success) {
        if (error) {
            response.status(500).json({error: {message: error}});
        }
        else {
            response.status(200).json({data: params.email});
        }
    });
}

function deleteUserById(res, id) {

    User.findByIdAndRemove(id, function (removeErr) {
        if (removeErr) {
            res.status(500).json({error: {message: "user_not_deleted"}});
        }
        else {
            res.status(500).json({error: {message: "user_deleted"}});
        }
    });
}