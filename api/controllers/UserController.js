/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  registrationWithEmail: function (req, res) {
    var params = req.body;

    if (params.access === 'email'
      && params.password
      && params.firstname
      && params.lastname
      && params.token
      && params.access
      && params.access === 'email') {
      User.RegistrationWithEmail(res, params);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  login: function (req, res) {
    var params = req.body;
    if (params.email && params.password) {
      User.LoginWithEmail(res, params.email, params.password);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  social: function (req, res) {
    var params = req.body;
    if (params && (params.access === 'facebook' || params.access === 'google') && !params.password) {
      User.LoginOrRegistrationWithSocial(res, params);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  setPassword: function (req, res) {
    var params = req.body;
    if (params && params.email) {
      User.SetPassword(res, params.email);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myProfile: function (req, res) {
    var params = req.params;
    if (params.id_user) {
      User.MyProfile(res, params.id_user);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

