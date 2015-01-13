/*
var ShareApp = require('../models/shareAppModel'),
    User = require('../models/usersModel'),
    _ = require('underscore'),
    Utils = require('../helpers/utils');

exports.insertAndUpdate = function (req, res) {

    var fields = ['id_user', 'email', 'contacts'];
    var params = req.body;

    if (Utils.validateFields(fields, params) && params.contacts.length > 0) {

        params.updated_at = new Date();

        for (var contact in params.contacts) {
            params.contacts[contact].date = new Date();
        }

        ShareApp
            .create(params)
            .then(
            function (userData) {
                res.status(200).json({data: userData});
            },
            function (error) {
                if (error.name === 'ValidationError') {
                    return updateUserContacts(res, params.id_user, params.contacts);
                }
                else {
                    res.status(500).json({error: {message: error}});
                }
            }
        );
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }
};

function updateUserContacts(res, idUser, contacts) {

    ShareApp
        .findOne()
        .where('id_user').equals(idUser)
        .select('contacts')
        .exec()
        .then(
        function (userData) {
            res.status(200).json({data: userData});
        },
        function (error) {
            res.status(500).json({error: {message: error}});
        }
    );

}*/
