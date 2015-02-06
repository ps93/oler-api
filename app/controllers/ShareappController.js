var Utils = require('../helpers/utils'),
    Shareapp = require('../models/Shareapp');

module.exports = {

    insertOrUpdate: function (req, res) {

        var fields = ['id_user', 'contacts'],
            params = req.body;

        if (Utils.validateFields(fields, params) && params.contacts.length > 0) {
            var idUser = params.id_user,
                contacts = params.contacts;

            Shareapp.InsertOrUpdate(res, idUser, contacts);
        }
        else {
            res.status(400).json({error: {message: "Bad request"}});
        }
    }

};