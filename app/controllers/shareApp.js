var _ = require('underscore'),
    Async = require('async'),
    Utils = require('../helpers/utils'),
    User = require('../models/usersModel'),
    ShareApp = require('../models/shareAppModel');

exports.insertAndUpdate = function (req, res) {

    var fields = ['id_user', 'contacts'],
        params = req.body;

    if (Utils.validateFields(fields, params) && params.contacts.length > 0) {

        var idUser = params.id_user,
            contacts = params.contacts;

        Async.parallel([
            // CHECK USER EXIST
            function (callback) {
                User
                    .findOne()
                    .where('_id').equals(idUser)
                    .select('email')
                    .exec(function (error, data) {
                        if (error) {
                            return callback(error);
                        }
                        callback(null, data);
                    });
            },
            // GET USER CONTACTS
            function (callback) {
                ShareApp
                    .findOne()
                    .where('id_user').equals(idUser)
                    .select('contacts')
                    .exec(function (error, data) {
                        if (error) {
                            return callback(error);
                        }
                        else if (data) {
                            var userDBContactsArray = _.pluck(data.contacts, "email");
                            callback(null, {
                                contactsDb: data.contacts,
                                contactsArray: userDBContactsArray
                            });
                        }
                        else {
                            callback(null, null);
                        }
                    });
            }
        ], function (error, responses) {
            if (error) {
                res.status(500).json({error: {message: error}});
            }
            else if (responses[0]) {

                var prepareObjectContacts = [];
                var prepareEmail = {
                    from: 'Oler Srl<oler@gmail.com>',
                    to: contacts,
                    subject: "Condividi questa fantastica app",
                    html: "Condivi questa fantastica app"
                };

                var config = Utils.emailConfiguration();
                config.sendMail(prepareEmail, function (error) {
                    if (error) {
                        res.status(500).json({error: {message: error}});
                    }
                    else {
                        if (responses[1]) {
                            prepareObjectContacts = responses[1].contactsDb;
                            for (var i = 0; i < contacts.length > 0; i++) {
                                var value = _.contains(responses[1].contactsArray, contacts[i]);
                                if (!value) {
                                    prepareObjectContacts.push({
                                        email: contacts[i],
                                        date: new Date()
                                    });
                                }
                            }

                            // UPDATE USER SHARE CONCTACTS
                            ShareApp
                                .findOneAndUpdate({contacts: prepareObjectContacts})
                                .where('id_user').equals(idUser)
                                .exec(function (error, data) {
                                    if (error) {
                                        res.status(500).json({error: {message: error}});
                                    }
                                    res.status(200).json({data: data});
                                });
                        }
                        else {
                            // CONTACTS FROM ARRAY TO OBEJCT
                            for (var i = 0; i < contacts.length; i++) {
                                prepareObjectContacts.push({
                                    email: contacts[i],
                                    date: new Date()
                                });
                            }

                            ShareApp({
                                'id_user': idUser,
                                'contacts': prepareObjectContacts
                            })
                                .save(function (error, data) {
                                    if (error) {
                                        res.status(500).json({error: {message: error}});
                                    }
                                    res.status(201).json({data: data});
                                });
                        }
                    }
                });
            }
            else {
                res.status(404).json({error: {message: "user_not_found"}});
            }
        });
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }
};