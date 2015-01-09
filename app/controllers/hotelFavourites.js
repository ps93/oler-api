var User = require('../models/usersModel'),
    HotelFavourites = require('../models/hotelFavourites'),
    Utils = require('../helpers/utils');

exports.insertAndUpdate = function (req, res) {

    var fields = ['id_user', 'hotelFavourites.hotel_code', 'hotelFavourites.name'];
    var params = req.body;

    if (Utils.validateFields(fields, params)) {
        var idUser = params.id_user;
        var userHotelData = params.hotelFavourites;

        HotelFavourites
            .findOne()
            .where('id_user').equals(idUser)
            .exec()
            .then(
            function (userData) {
                if (userData) {
                    var hotels = addHotel(userHotelData, userData.hotelFavourites);
                    if (hotels.length > 0) {
                        return addRemoveExistUserWithHotelFavourites(res, idUser, hotels);
                    }
                    else {
                        res.status(401).json({error: {message: 'hotel_is_present'}});
                    }
                }
                else {
                    return addNewUserWithHotelFavourites(res, idUser, userHotelData);
                }
            },
            function (error) {
                res.status(500).json({error: {message: error}});
            }
        );
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

        HotelFavourites
            .findOne()
            .where('id_user').equals(idUser)
            .where('hotelFavourites.hotel_code').equals(hotelCode)
            .exec()
            .then(
            function (userData) {
                if (userData) {
                    var hotels = removeHotel(hotelCode, userData.hotelFavourites);
                    return addRemoveExistUserWithHotelFavourites(res, idUser, hotels);
                }
                else {
                    res.status(404).json({error: {message: 'hotel_not_found'}});
                }
            },
            function (error) {
                res.status(500).json({error: {message: error}});
            }
        );
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
            .exec()
            .then(
            function (userData) {
                if (userData && userData.hotelFavourites) {
                    res.status(200).json({data: userData});
                }
                else {
                    res.status(404).json({error: {message: "nothing_hotel_favourites"}});
                }
            },
            function (error) {
                res.status(500).json({error: {message: error}});
            }
        );
    }
};

function addNewUserWithHotelFavourites(res, idUser, userHotelData) {
    HotelFavourites
        .create({
            id_user: idUser,
            hotelFavourites: [userHotelData]
        })
        .then(
        function (userData) {
            res.status(201).json({data: userData});
        },
        function (error) {
            res.status(500).json({error: {message: error}});
        });
}

function addRemoveExistUserWithHotelFavourites(res, idUser, hotels) {
    HotelFavourites
        .findOneAndUpdate({hotelFavourites: hotels})
        .where('id_user').equals(idUser)
        .exec()
        .then(
        function (hotelFavouritesUpdated) {
            res.status(200).json({data: hotelFavouritesUpdated});
        },
        function (error) {
            res.status(500).json({error: {message: error}});
        }
    );
}

function addHotel(userHotelData, hotels) {
    var hotelFounded = false;

    for (var hotel in hotels) {
        if (hotels[hotel].hotel_code == userHotelData.hotel_code) {
            hotelFounded = true;
            break;
        }
    }
    if (hotelFounded) {
        return [];
    }
    else {
        hotels.push(userHotelData);
        return hotels;
    }
}

function removeHotel(hotelCode, hotels) {
    var hotelFounded = false;
    var pos = undefined;

    for (var i = 0; i < hotels.length; i++) {
        if (hotels[i].hotel_code == hotelCode) {
            hotelFounded = true;
            pos = i;
            break;
        }
    }

    if (hotelFounded) {
        hotels.splice(pos, 1);
        return hotels;
    }
    else {
        return [];
    }
}

