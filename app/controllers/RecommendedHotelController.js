var Utils = require('../helpers/utils'),
    Recommendedhotel = require('../models/RecommendedHotel');

module.exports = {

    insertRecommendedHotel: function (req, res) {
        var fields = ['id_user', 'id_hotel', 'friends'];
        var params = req.body;

        if (Utils.validateFields(fields, params)) {
            Recommendedhotel.InsertRecommendedHotel(res, params.id_user, params.id_hotel, params.friends);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    },

    recommendedHotelsByUser: function (req, res) {

        var fields = ['id_user'];
        var params = req.params;

        if (Utils.validateFields(fields, params)) {
            Recommendedhotel.RecommendedHotelsByUser(res, params.id_user);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    }

};