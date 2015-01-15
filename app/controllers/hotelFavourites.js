var Async = require('async'),
    User = require('../models/usersModel'),
    _ = require('underscore'),
    HotelFavourites = require('../models/hotelFavourites'),
    Utils = require('../helpers/utils');

exports.insertAndUpdate = function (req, res) {

    var fields = ['id_user', 'hotelFavourites.hotel_code', 'hotelFavourites.name'];
    var params = req.body;

    if (Utils.validateFields(fields, params)) {
        Async.parallel([
                // CHECK USER EXIST
                function (callback) {
                    User
                        .findOne()
                        .where('_id').equals(params.id_user)
                        .select('email')
                        .exec(function (error, data) {
                            if (error) {
                                return callback(error);
                            }
                            return callback(null, data);
                        });

                },
                // GET USER FAVOURITES
                function (callback) {
                    HotelFavourites
                        .findOne()
                        .where('id_user').equals(params.id_user)
                        .exec(function (error, data) {
                            if (error) {
                                return callback(error);
                            }
                            return callback(null, data);
                        });
                },
                // CHECK HOTEL EXIST
                function (callback) {
                    HotelFavourites
                        .findOne()
                        .where('id_user').equals(params.id_user)
                        .where('hotelFavourites.hotel_code').equals(params.hotelFavourites.hotel_code)
                        .select('hotelFavourites')
                        .exec(function (error, data) {
                            if (error) {
                                return callback(error);
                            }
                            else {
                                return callback(null, data);
                            }
                        });
                }
            ],
            function (error, responses) {
                if (error) {
                    res.status(500).json({error: {message: error}});
                }
                // ADD USER HOTEL FAVOURITES
                else if (responses[0] && responses[1]) {
                    if (responses[2]) {
                        res.status(401).json({error: {message: "hotel_is_present"}});
                    }
                    else {
                        var hotels = responses[1].hotelFavourites;
                        hotels.push(params.hotelFavourites);

                        HotelFavourites
                            .findOneAndUpdate({hotelFavourites: hotels})
                            .where('id_user').equals(params.id_user)
                            .exec(function (error, data) {
                                if (error) {
                                    res.status(500).json({error: {message: error}});
                                }
                                else {
                                    res.status(200).json({data: data});
                                }
                            });
                    }
                }
                // CREATE USER HOTEL FAVOURITES
                else if (responses[0] && responses[1] === null) {

                    var userFavourites = new HotelFavourites({
                        id_user: params.id_user,
                        hotelFavourites: [params.hotelFavourites]
                    });

                    userFavourites.save(function (error, data) {
                        if (error) {
                            res.status(500).json({error: {message: error}});
                        }
                        else {
                            res.status(201).json({data: data});
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

exports.remove = function (req, res) {
    var fields = ['id_user', 'hotel_code'];
    var params = req.params;

    if (Utils.validateFields(fields, params)) {
        var idUser = params.id_user;
        var hotelCode = params.hotel_code;
        var hotels;

        Async.series([
                // CHECK HOTEL EXIST
                function (callback) {
                    HotelFavourites
                        .findOne()
                        .where('id_user').equals(idUser)
                        .where('hotelFavourites.hotel_code').equals(hotelCode)
                        .exec(function (error, data) {
                            if (error) {
                                return callback(error);
                            }
                            if (data) {
                                hotels = data.hotelFavourites;
                                callback();
                            }
                            else {
                                res.status(404).json({error: {message: "hotel_not_found"}});
                            }
                        });
                },
                // REMOVE HOTEL FAVOURITE
                function (callback) {

                    for (var i = 0; i < hotels.length; i++) {
                        if (hotels[i].hotel_code == hotelCode) {
                            hotels.splice(i, 1);
                            break;
                        }
                    }

                    HotelFavourites
                        .findOneAndUpdate({hotelFavourites: hotels})
                        .where('id_user').equals(idUser)
                        .exec(function (error, data) {
                            if (error) {
                                return callback(error);
                            }
                            else {
                                res.status(200).json({data: data});
                            }
                        });
                }
            ],
            function (error) {
                res.status(500).json({error: {message: error}});
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
                if (error) {
                    res.status(500).json({error: {message: error}});
                }
                if (data && data.hotelFavourites.length > 0) {
                    res.status(200).json({data: data});
                }
                else {
                    res.status(404).json({error: {message: "nothing_hotel_favourites"}});
                }
            });
    }
};

