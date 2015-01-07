/*
// LOAD MODEL
// ==============================================
var User = require('../models/usersModel'),
    Shareapp = require('../models/shareAppModel'),
    Utils = require('../helpers/utils'),
    lang = 'it';

exports.insert = function (req, res) {

    var fields = ['firstname', 'lastname', 'email', 'password'];
    if (!Utils.validateFields(fields, req.body)) {
        Utils.buildHttpResponse(res, 3, lang);
    }
    else if (req.body.password.length < 8) {
        Utils.buildHttpResponse(res, 7, lang);
    }
    else {
        var query = new User({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password
        });

        query.save(function (error, userData) {
            checkIfEmailWasShared(res, error, userData, req.body.email);
        });
    }
};

function checkIfEmailWasShared(res, error, userData, email) {
    if (error && error.name !== 'ValidationError') {
        Utils.buildHttpResponse(res, 2, lang);
    }
    else if (error && error.name === 'ValidationError') {
        Utils.buildHttpResponse(res, 5, lang);
    }
    else {
        var query = Shareapp
            .find()
            .where('email').equals(email)
            .where('disabled').equals(false)
            .sort('created_at');

        query.exec(function (error, emails) {
            if (error) {
                Utils.buildHttpResponse(res, 2, lang);
            }
            else if (emails.length > 0) {
                getUserPoints(res, emails[0].id_user);
            }
            else {
                res
                    .status(201)
                    .json({data: {user: userData}});
            }
        });
    }
}

function getUserPoints(res, idUser) {
    var query = User
        .findOne({_id: idUser})
        .select('points');
    query.exec(function (error, userData) {
        assignUserPoints(res, error, userData);
    });
}

function assignUserPoints(res, error, userData) {
    if (error) {
        Utils.buildHttpResponse(res, 2, lang);
    }
    else {
        var query = User
            .findByIdAndUpdate(userData._id, {
                points: userData.points + 4
            });
        query.exec(function (error, userDataWithPointsEarned) {
            if (!error) {
                var socketio = req.app.get('socketio');
                socketio.sockets.emit('userPointsUpdated', userDataWithPointsEarned);
                res
                    .status(201)
                    .json({data: {user: success}});
            }
        });
    }
}

exports.modify = function (req, res) {

    var query = User.findByIdAndUpdate(req.params._id, {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password
    });

    query.exec(function (error, success) {
        if (error)
            res.status(500);
        else if (success)
            res
                .status(200)
                .json({message: 'Risorsa modificata con successo'});
        else
            res
                .status(404)
                .json({message: 'Risorsa non trovata'});
    });

};

exports.remove = function (req, res) {

    var query = User.remove({_id: req.params._id});

    query.exec(function (error, success) {
        if (error)
            res.status(500);
        else if (success)
            res
                .status(200)
                .json({message: 'Risorsa cancellata con successo'});
        else
            res
                .status(404)
                .json({message: 'Risorsa non trovata'});
    });

};

exports.users = function (req, res) {

    User.find(function (error, users) {
        if (error)
            res
                .status(500)
                .json({message: 'Problemi con i server interni, riprovare più tardi!'});
        else {
            res
                .status(200)
                .json({
                    data: {
                        users: users
                    }
                });
        }
    });

};

exports.user = function (req, res) {
    User.find({_id: req.params._id},
        function (error, user) {
            if (error)
                res
                    .status(500)
                    .json({message: 'Problemi con i server interni, riprovare più tardi!'});
            else {
                if (user.length > 0) {
                    res
                        .status(200)
                        .json({
                            data: {
                                user: user[0]
                            }
                        });
                }
                else {
                    res
                        .status(404)
                        .json({message: 'Risorsa non trovata'});
                }
            }
        });
};*/
