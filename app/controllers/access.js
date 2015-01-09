var MD5 = require('MD5'),
    User = require('../models/usersModel'),
    Utils = require('../helpers/utils');

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
            .select('email firstname lastname image points updated_at')
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

exports.registrationWithEmail = function (request, response) {

    var fields = ['login.id', 'login.name', 'password', 'firstname', 'lastname', 'email'];
    var params = request.body;

    if (Utils.validateFields(fields, params)
        && params.login.id === '0'
        && params.login.name === 'email') {

        params.password = MD5(params.password);

        User
            .create(params)
            .then(
            function (user) {
                return showUserCreated(response, user);
            },
            function (error) {
                if (error.errors && error.errors['email'] && error.errors['email'].message === 'email_is_present') {
                    response.status(200).json({
                        error: {
                            code: error.errors['email'].message,
                            message: error.errors['email'].message
                        }
                    });
                }
                else {
                    response.status(500).json({error: {message: error}});
                }
            });
    }
    else {
        response.status(400).json({error: {message: "Bad request"}});
    }
};

exports.accessWithSocial = function (request, response) {

    var fields = ['login.id', 'login.name', 'email', 'firstname', 'lastname'];
    var params = request.body;

    if (Utils.validateFields(fields, params)
        && !params.hasOwnProperty('password')
        && (params.login.name === 'facebook'
        || params.login.name === 'google')) {

        User
            .create(params)
            .then(
            function (user) {
                return showUserCreated(response, user);
            }, function (error) {
                if (error.errors && error.errors['email'] && error.errors['email'].message === 'email_is_present') {
                    return updateUserAccount(params, response);
                }
                else {
                    response.status(500).json({error: {message: error}});
                }
            });
    }
    else {
        response.status(400).json({error: {message: "Bad request"}});
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

function updateUserAccount(params, response) {
    params.updated_at = new Date();

    User
        .findOneAndUpdate(params)
        .where('email').equals(params.email)
        .select('firstname lastname email image points updated_at')
        .exec()
        .then(
        function (userModified) {
            response
                .status(200)
                .json({data: userModified});
        },
        function (error) {
            response.status(500).json({error: {message: error}});
        });
}

function showUserCreated(response, data) {
    response
        .status(201)
        .json({
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