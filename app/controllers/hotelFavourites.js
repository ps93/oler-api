var Async = require('async'),
    User = require('../models/usersModel'),
    _ = require('underscore'),
    HotelFavourites = require('../models/hotelFavourites'),
    HotelWorld = require('../models/HotelsWorldModel'),
    Utils = require('../helpers/utils');


exports.insertAndUpdate = function (req, res) {

    var fields = ['id_user', 'hotel.google_key', 'hotel.name'];
    var params = req.body;

    if (Utils.validateFields(fields, params)) {
        var userID = params.id_user;
        var hotelGKey = params.hotel.google_key;

        Async.parallel([

                // CHECK USER EXIST IN FAVOURITES
                function (callback) {
                    HotelFavourites
                        .findOne()
                        .where('id_user').equals(userID)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            return callback(null, data);
                        });
                },

                // CHECK USER HAS HOTEL IN FAVOURITES
                function (callback) {
                    HotelFavourites
                        .findOne()
                        .where('id_user').equals(userID)
                        .where('hotelFavourites.google_key').equals(hotelGKey)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            else if(data !== null) return callback({status: 401, message: "hotel_is_present"});
                            else return callback(null, data);
                        });
                },

                // CHECK HOTEL EXIST IN HOTEL WORLDS
                function (callback) {
                    HotelWorld
                        .findOne()
                        .where('hotelCodes.google_key').equals(hotelGKey)
                        .select('_id')
                        .exec(function (error, data) {
                            if (error) return callback({status: 500, message: error});
                            return callback(null, data);
                        });
                }
            ],
            function (error, responses) {
                if (error) {
                    res.status(error.status).json({error: {message: error.message}});
                }

                // CASE 1: INSERT NEW HOTEL WORLD AND CREATE ROW USER WITH HOTEL FAVOURITE
                else if (responses[0] === null && responses[2] === null) {
                    // INSERT HOTEL IN HOTEL WORLD
                    HotelWorld({
                        hotelCodes: {
                            google_key: hotelGKey
                        },
                        name: params.hotel.name
                    }).save(function (error) {
                        if (error) res.status(500).json({error: {message: error}});
                        else {
                            // INSERT USER FAVOURITES
                            HotelFavourites({
                                id_user: userID,
                                hotelFavourites: [{google_key: hotelGKey}]
                            }).save(function (error, data) {
                                if (error) res.status(500).json({error: {message: error}});
                                else {
                                    res.status(201).json({data: data});
                                }
                            });
                        }
                    });
                }

                // CASE 2: ADD USER HOTEL IN FAVOURITES AND INSERT NEW HOTEL WORLD
                else if (responses[0] !== null && responses[1] === null && responses[2] === null) {
                    HotelWorld({
                        hotelCodes: {
                            google_key: hotelGKey
                        },
                        name: params.hotel.name
                    }).save(function (error) {
                        if (error) res.status(500).json({error: {message: error}});
                        else {
                            HotelFavourites
                                .findOneAndUpdate(
                                {id_user: userID},
                                {$push: {hotelFavourites: {google_key: hotelGKey}}},
                                {safe: true, upsert: true})
                                .exec(function (error, data) {
                                    if (error) res.status(500).json({error: {message: error}});
                                    else res.status(200).json({data: data});
                                });
                        }
                    });
                }

                // CASE 3:
                else if (responses[0] !== null && responses[1] === null && responses[2] !== null) {
                    HotelFavourites
                        .findOneAndUpdate(
                        {id_user: userID},
                        {$push: {hotelFavourites: {google_key: hotelGKey}}},
                        {safe: true, upsert: true})
                        .exec(function (error, data) {
                            if (error) res.status(500).json({error: {message: error}});
                            else res.status(200).json({data: data});
                        });
                }
                else {
                    res.status(200).json({data: 'hotel_is_present'});
                }
            });
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }
};

exports.remove = function (req, res) {

    var fields = ['id_user', 'google_key'];
    var params = req.params;

    if (Utils.validateFields(fields, params)) {

        var idUser = params.id_user;
        var hotelGKey = params.google_key;

        Async.series([
            function (callback) {
                HotelFavourites
                    .findOne()
                    .where('id_user').equals(idUser)
                    .where('hotelFavourites.google_key').equals(hotelGKey)
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else if (data !== null) return callback(null, data);
                        else return callback({status: 404, message: "hotel_not_found"});
                    }
                );
            },
            function (callback) {
                HotelFavourites
                    .findOneAndUpdate(
                    {id_user: idUser},
                    {$pull: {hotelFavourites: {google_key: hotelGKey}}},
                    {safe: true, upsert: true}
                ).exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else return callback(null, data);
                    });
            },
            function (callback) {
                HotelFavourites
                    .findOne()
                    .where('id_user').equals(idUser)
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else if (data && data.hotelFavourites.length > 0) {
                            var hotelsToSearch = _.pluck(data.hotelFavourites, 'google_key');
                            HotelWorld
                                .find()
                                .where('hotelCodes.google_key').in(hotelsToSearch)
                                .exec(function (error, hotels) {
                                    if (error) return callback({status: 500, message: error});
                                    else return callback(null, hotels);
                                });
                        }
                        else return callback({status: 404, message: "nothing_hotel_favourites"});
                    });
            }
        ], function (error, responses) {
            if (error) {
                res.status(error.status).json({error: {message: error.message}});
            }
            else {
                res.status(200).json({data: responses[2]});
            }
        });
    }
    else {
        res.status(400).json({error: {message: "Bad request"}});
    }

};

exports.hotelsFavouritesByUserId = function (req, res) {

    var idUser = req.params.id_user;
    if (idUser) {
        HotelFavourites
            .findOne()
            .where('id_user').equals(idUser)
            .exec(function (error, data) {
                if (error) res.status(500).json({error: {message: error}});

                else if (data && data.hotelFavourites.length > 0) {

                    var hotelsToSearch = _.pluck(data.hotelFavourites, 'google_key');

                    HotelWorld
                        .find()
                        .where('hotelCodes.google_key').in(hotelsToSearch)
                        .exec(function (error, hotels) {
                            if (error) res.status(500).json({error: {message: error}});
                            else res.status(200).json({data: hotels});
                        });
                }
                else res.status(404).json({error: {message: "nothing_hotel_favourites"}});
            });
    }
};

