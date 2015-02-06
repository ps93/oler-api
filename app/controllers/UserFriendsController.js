var Utils = require('../helpers/utils'),
    Userfriends = require('../models/UserFriends');

module.exports = {

    userFriendList: function (req, res) {

        var fields = ['id_user'];
        var params = req.params;

        if (Utils.validateFields(fields, params)) {
            Userfriends.UserFriendList(res, params.id_user);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }

    }

};