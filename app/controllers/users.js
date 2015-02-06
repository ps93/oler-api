// LOAD MODEL
// ==============================================
var User = require('../models/User'),
    Utils = require('../helpers/utils');

exports.getUserData = function (req, res) {

    var id = req.params._id;

    if (id) {
        User
            .findOne()
            .where('_id').equals(id)
            .select('firstname lastname image points')
            .exec()
            .then(
            function (user) {
                if (user) {
                    res.status(200).json({data: user});
                }
                else {
                    res.status(404).json({error: {message: "user_is_not_present"}});
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

