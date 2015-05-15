// Specify a string key:    
// Don't do this though, your keys should most likely be stored in env variables
// and accessed via process.env.MY_SECRET_KEY
var key = '88E82AB13D597D5A18E6EE61288CE';

var MD5 = require('MD5');
var encryptor = require('simple-encryptor')(key);

module.exports = {

  TokenGenerator: function (email) {

    var SECRET = 'A85BD92293E7B347C415C6E8F8B5A'; //DON'T CHANGE
    var prepareToken;
    var separator = MD5('@12bh@');

    prepareToken = encryptor.encrypt(email) + separator + MD5(new Date()) + MD5(SECRET);

    return prepareToken;
  }

};
