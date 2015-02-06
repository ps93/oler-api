var db = require('mongoose'),
    Schema = db.Schema,
    _ = require('underscore'),
    Async = require('async'),
    Utils = require('../helpers/utils'),
    User = require('../models/User');

var ShareAppSchema = new Schema({

    id_user: {type: String, unique: true, required: true},
    contacts: [{email: String, date: Date}],
    created_at: {type: Date, default: Date.now()},
    updated_at: {type: Date}

});

var Shareapp = db.model('shareapp', ShareAppSchema);

var self = {

    Model: function () {
        return db.model('shareapp', ShareAppSchema);
    },

    InsertOrUpdate: function (res, idUser, contacts) {
        Async.parallel({
                userIsRegistred: function (callback) {
                    User
                        .findOne()
                        .where('_id').equals(idUser)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) return callback(error);
                            else callback(null, data);
                        });
                },
                userHasContacts: function (callback) {
                    Shareapp
                        .findOne()
                        .where('id_user').equals(idUser)
                        .select('contacts')
                        .exec(function (error, data) {
                            if (error) return callback(error);
                            else if (data) {
                                return callback(null, {
                                    contactsDb: data.contacts,
                                    contactsArray: _.pluck(data.contacts, 'email')
                                });
                            }
                            else return callback(null, null);
                        });
                }
            },
            function (error, callback) {
                if (error) res.status(500).json({error: {message: error}});
                else if (callback.userIsRegistred) {
                    var prepareObjectContacts = [];
                    var prepareEmail = {
                        from: 'Oler Srl<oler@gmail.com>',
                        bcc: contacts,
                        subject: "Condividi questa fantastica app",
                        html: "Condivi questa fantastica app"
                    };

                    var config = Utils.emailConfiguration();
                    config.sendMail(prepareEmail, function (error) {
                        if (error) res.status(500).json({error: {message: error}});

                        else {
                            if (callback.userHasContacts) {
                                prepareObjectContacts = callback.userHasContacts.contactsDb;
                                for (var i = 0; i < contacts.length > 0; i++) {
                                    var value = _.contains(callback.userHasContacts.contactsArray, contacts[i]);
                                    if (!value) {
                                        prepareObjectContacts.push({email: contacts[i], date: new Date()});
                                    }
                                }
                                // UPDATE USER SHARE CONCTACTS
                                Shareapp
                                    .findOneAndUpdate({contacts: prepareObjectContacts})
                                    .where('id_user').equals(idUser)
                                    .exec(function (error, data) {
                                        if (error) res.status(500).json({error: {message: error}});
                                        else res.status(200).json({data: data});
                                    });
                            }
                            else {
                                // CONTACTS FROM ARRAY TO OBJECT
                                for (var i = 0; i < contacts.length; i++) {
                                    prepareObjectContacts.push({email: contacts[i], date: new Date()});
                                }
                                Shareapp({'id_user': idUser, 'contacts': prepareObjectContacts})
                                    .save(function (error, data) {
                                        if (error) res.status(500).json({error: {message: error}});
                                        else res.status(201).json({data: data});
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

};

module.exports = self;