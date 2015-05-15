/**
 * ShareappController
 *
 * @description :: Server-side logic for managing shareapps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  insert: function (req, res) {
    var params = req.body;
    if (params.id_user && params.contacts && _.isArray(params.contacts) && params.contacts.length > 0) {
      var contacts = ValidationService.ValidationTrim(params.contacts, 'email');
      Shareapp.Insert(res, params.id_user, contacts);
    }
    else res.status(400).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};
