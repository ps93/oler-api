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
    var contactsNotRegistered = [];

    async.series([
      /****************************************************************/
      /* 1. ELIMINA DALLA LISTA GLI UTENTI GIA' REGISTRATI ALL'APP    */
      /****************************************************************/
      function (callback) {
        User
          .find({email: contacts})
          .exec(function (error, data) {
            if (error) return callback(error);
            else {
              for (var i = 0; i < contacts.length; i++)
                if ((_.where(data, {email: contacts[i]})).length === 0)contactsNotRegistered.push(contacts[i]);
              return callback();
            }
          });
      },
      /****************************************************************/
      /* 2. ELIMINA DALL'INSERIMENTO GLI UTENTI CON CUI HO            */
      /*    GIA' CONDIVISO L'APP                                      */
      /****************************************************************/
      function (callback) {
        if (contactsNotRegistered.length > 0) {
          Shareapp
            .find({id_user: idUser, contact: contactsNotRegistered})
            .exec(function (error, data) {
              if (error) return callback(error);
              else {
                for (var i = 0; i < contactsNotRegistered.length; i++) {
                  if (data.length > 0) {
                    if ((_.where(data, {contact: contactsNotRegistered[i]})).length == 0)
                      prepareInsertDocs.push({id_user: idUser, contact: contactsNotRegistered[i]});
                  }
                  else prepareInsertDocs.push({id_user: idUser, contact: contactsNotRegistered[i]});
                }
                return callback();
              }
            });
        }
        else return res.forbidden({message: 'I contatti selezionati sono già registrati.'});
      },
      /****************************************************************/
      /* 3. INSERIMENTO E/O INVIO EMAIL AI CONTATTI SELEZIONATI         */
      /****************************************************************/
      function (callback) {
        if (prepareInsertDocs.length > 0) {
          Shareapp
            .create(prepareInsertDocs)
            .exec(function (error, data) {
              if (error) return callback(error);
              else EmailService.ShareAppWithContacts(res, contactsNotRegistered);
            });
        }
        else EmailService.ShareAppWithContacts(res, contactsNotRegistered);
      }
    ], function (error) {
      if (error) return res.serverError({message: error});
    });
  }

};

