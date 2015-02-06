var Utils = require('../helpers/utils'),
    User = require('../models/User');

module.exports = {

    registrationWithEmail: function (req, res) {
        var fields = ['email', 'password', 'firstname', 'lastname', 'access.name'];
        var params = req.body;

        if (Utils.validateFields(fields, params) && params.access && params.access.name === 'email') {
            User.RegistrationWithEmail(res, params);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    },

    loginWithEmail: function (req, res) {
        var fields = ['email', 'password'];
        var params = req.body;

        if (Utils.validateFields(fields, params)) {
            User.LoginWithEmail(res, params.email, params.password);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    },

    loginOrRegistationWithSocial: function (req, res) {
        var fields = ['email', 'firstname', 'lastname', 'access.code', 'access.name', 'access.token'];
        var params = req.body;

        if (Utils.validateFields(fields, params) && !params.hasOwnProperty('password')
            && (params.access.name == 'facebook' || params.access.name === 'google')) {
            User.LoginOrRegistrationWithSocial(res, params);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    },

    changePassword: function (req, res) {
        var fields = ['email'];
        var params = req.body;

        if (Utils.validateFields(fields, params)) {
            User.ChangePassword(res, params.email);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    }

};


