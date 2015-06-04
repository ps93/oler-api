/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  registrationWithEmail: function (req, res) {
    var params = req.body;

    if (params.email && params.email.trim()
      && params.password && params.password.trim()
      && params.firstname && params.firstname.trim()
      && params.lastname && params.lastname.trim()
      && params.access && params.access === 'email') {
      User.RegistrationWithEmail(res, params);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  login: function (req, res) {
    var params = req.body;
    if (params.email && params.email.trim() && params.password && params.password.trim()) {
      User.LoginWithEmail(res, params.email, params.password);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  social: function (req, res) {
    var params = req.body;
    if (params.email && params.email.trim()
      && params.firstname && params.firstname.trim()
      && params.lastname && params.lastname.trim()
      && (params.access === 'facebook' || params.access === 'google')) {
      User.LoginOrRegistrationWithSocial(res, params);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  setPassword: function (req, res) {
    var params = req.body;
    if (params.email && params.email.trim()) {
      User.SetPassword(res, params.email);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  myProfile: function (req, res) {
    var params = req.params;
    if (params.id_user && params.id_user.trim()) {
      User.MyProfile(res, params.id_user);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  logout: function (req, res) {
    var headers = req.headers;
    var params = req.params;
    if (params.id_user && params.id_user.trim()
      && headers.token && headers.token.trim()) {
      User.Logout(res, params.id_user, headers.token);
    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  },

  editProfile: function (req, res) {
    var paramsFromUrl = req.params;
    var params = req.body;

    if (paramsFromUrl.id_user
      && params.firstname && params.firstname.trim()
      && params.lastname && params.lastname.trim()
      && params.hasOwnProperty('phone')
      && params.hasOwnProperty('street_address')
      && params.hasOwnProperty('city')
      && params.hasOwnProperty('zipcode')
      && params.hasOwnProperty('country')) {

      User.EditProfile(res,
        paramsFromUrl.id_user,
        params.firstname,
        params.lastname,
        params.phone,
        params.street_address,
        params.city,
        params.zipcode,
        params.country);

    }
    else return res.status(404).json({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
  }

};

