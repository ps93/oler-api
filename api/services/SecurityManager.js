var MD5 = require('MD5');

module.exports = {

  TokenGenerator: function (email, password) {

    var SECRET = 'A85BD92293E7B347C415C6E8F8B5A'; //DON'T CHANGE
    var prepareToken;

    prepareToken = MD5(email) + MD5(password) + MD5(new Date()) + MD5(SECRET);

    return prepareToken;
  }

};
