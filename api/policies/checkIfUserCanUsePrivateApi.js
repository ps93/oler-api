// Specify a string key:
// Don't do this though, your keys should most likely be stored in env variables
// and accessed via process.env.MY_SECRET_KEY
var key = '88E82AB13D597D5A18E6EE61288CE';

var MD5 = require('MD5');
var encryptor = require('simple-encryptor')(key);

module.exports = function (req, res, next) {

  var headers = req.headers;
  var params = req.params;
  var PRIVATE_API_KEY = '88E82AB13D597D5A18E6EE61288CE';
  //SE VIENE MODIFICATO, DOVETE AGGIORNARLO ANCHE IN checkIIfUserCanUsePrivateApi
  var separator = MD5('@12bh@');

  if (headers && headers.authorization === PRIVATE_API_KEY && headers.token && _.contains(headers.token, separator)) {
    var token = headers.token;
    var getUserEmailByToken = token.split(separator)[0];
    var email = encryptor.decrypt(getUserEmailByToken);

      User
      .findOne({email: email, token: token})
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else if (!_.isEmpty(data)) next();
        else res.status(401).json({message: 'Non sei autorizzato a fare questo tipo di richiesta.'});
      });

  }
  else res.status(401).json({message: 'Non sei autorizzato a fare questo tipo di richiesta.'});

};
