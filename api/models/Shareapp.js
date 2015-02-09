/**
 * Shareapp.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'shareapps',

  attributes: {
    user_id: {
      model: 'user'
    },
    contact: {
      type: 'email',
      required: true
    }
  },

  Insert: function (res, idUser, contacts) {

    var prepareInsertDocs = [];

    async.series([
      function (callback) {
        Shareapp
          .find({id_user: idUser, contact: contacts})
          .exec(function (error, data) {
            if (error) return callback(error);
            else {
              for (var i = 0; i < contacts.length; i++) {
                if (data.length > 0) {
                  if ((_.where(data, {contact: contacts[i]})).length == 0) {
                    prepareInsertDocs.push({id_user: idUser, contact: contacts[i]});
                  }
                }
                else prepareInsertDocs.push({id_user: idUser, contact: contacts[i]});
              }
              return callback();
            }
          });
      },
      function (callback) {
        if (prepareInsertDocs.length > 0) {
          Shareapp
            .create(prepareInsertDocs)
            .exec(function (error, data) {
              if (error) return callback(error);
              else EmailService.ShareAppWithContacts(res, contacts);
            });
        }
        else EmailService.ShareAppWithContacts(res, contacts);
      }
    ], function (error) {
      if (error) return res.serverError({message: error});
    });

  }

};

