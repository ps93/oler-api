var db = require('mongoose'),
    Schema = db.Schema,
    Async = require('async'),
    _ = require('underscore'),
    UserModel = require('../models/User'),
    User = UserModel.Model();

var RecommendedHotelSchema = new Schema({
    id_user: {type: String, required: true},
    id_hotel: {type: String, required: true},
    id_friend: {type: String, required: true},
    created_at: {type: Date, default: new Date()}
});

var self = {

    Model: function () {
        return db.model('recommended_hotels', RecommendedHotelSchema);
    },

    InsertRecommendedHotel: function (res, idUser, idHotel, friends) {

        var Recommendedhotel = self.Model();
        var prepareInsertDocs = [];

        Async.series([
            /****************************************************************/
            /* 1. CONTROLLA CHE id_user SIA PRENSENTE NEL DB                */
            /****************************************************************/
            function (callback) {
                User
                    .findOne()
                    .where('_id').equals(idUser)
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else if (!data) return callback({status: 404, message: 'user_not_found'});
                        else return callback();
                    });
            },
            /****************************************************************/
            /* 2. VERIFICA SE L'HOTEL E' GIA' STATO CONSIGILIATO            */
            /*    DALLA STESSA PERSONA E LO RIMUOVE DALL'INSERIMENTO        */
            /****************************************************************/
            function (callback) {
                Recommendedhotel
                    .find()
                    .where('id_user').equals(idUser)
                    .where('id_hotel').equals(idHotel)
                    .where('id_friend').in(friends)
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else {
                            for (var i = 0; i < friends.length; i++) {
                                if (data.length > 0) {
                                    if ((_.where(data, {id_friend: friends[i]})).length == 0) {
                                        prepareInsertDocs.push({id_user: idUser, id_hotel: idHotel, id_friend: friends[i]});
                                    }
                                }
                                else prepareInsertDocs.push({id_user: idUser, id_hotel: idHotel, id_friend: friends[i]});
                            }
                            return callback();
                        }
                    });
            },
            /****************************************************************/
            /* 3. INSERIMENTO DEL HOTEL CONSIGLIATO                         */
            /****************************************************************/
            function (callback) {
                if (prepareInsertDocs.length > 0) {
                    Recommendedhotel
                        .create(prepareInsertDocs,
                        function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else res.status(200).json({data: 'L\'hotel è stato condiviso correttamente'});
                        });
                }
                else return callback({status: 401, message: 'L\'hotel è già stato consigliato da queste persone'});
            }
        ], function (error) {
            if (error) res.status(error.status).json({error: {message: error.message}});
        });
    },

    RecommendedHotelsByUser: function (res, idUser) {

        var Recommendedhotel = self.Model();

        Async.series([
            /****************************************************************/
            /* 1.                                                           */
            /****************************************************************/
            function (callback) {
                Recommendedhotel
                    .find()
                    .where('id_user').equals(idUser)
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else if (data.length > 0) {

                            var test = [];
                            var found = false;
                            var pos;
                            for (var i = 0; i < data.length; i++) {
                                if (test.length > 0) {

                                    for (var j = 0; j < test.length; j++) {
                                        if (test[j].id_hotel == data[i].id_hotel) {
                                            found = true;
                                            pos = j;
                                            break;
                                        }
                                    }

                                    if (found) {
                                        test[pos].friends.push(data[i].id_friend);
                                        found = false;
                                    }
                                    else {
                                        test.push({id_hotel: data[i].id_hotel, friends: [data[i].id_friend]});
                                    }
                                }
                                else {
                                    test.push({id_hotel: data[i].id_hotel, friends: [data[i].id_friend]});
                                }
                            }
                            res.status(200).json({data: data, test: test});
                        }
                        else
                            return callback({status: 404, message: 'user_not_found'});
                    });
            },
            /****************************************************************/
            /* 2.                                                           */
            /****************************************************************/
            function (callback) {

            }
        ], function (error) {
            if (error) res.status(error.status).json({error: {message: error.message}});
        });


    }

};

module.exports = self;