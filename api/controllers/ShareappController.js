/**
 * ShareappController
 *
 * @description :: Server-side logic for managing shareapps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {
    var params = req.body;
    if (params.id_user && params.contacts && params.contacts.length > 0) {
      Shareapp.Insert(res, params.id_user, params.contacts);
    }
    else res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};
