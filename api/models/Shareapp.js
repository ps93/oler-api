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
    firstname: 'string',
    lastname: 'string',
    contact: {
      type: 'email',
      required: true
    }
  },

  Insert: function (res, idUser, contacts) {

    var prepareInsertDocs = [];
    var contactsNotRegistered = [];
    var userRegistered = [];

    async.series([
        //****************************************************************//
        //* 1. ELIMINA DALLA LISTA GLI UTENTI GIA' REGISTRATI ALL'APP    *//
        //****************************************************************//
        function (callback) {

          var emailContacts = _.map(contacts, 'email');

          User
            .find({email: emailContacts})
            .exec(function (error, data) {
              if (error) return callback(error);
              else if(data.length > 0) {
                for (var i = 0; i < contacts.length; i++) {
                  if ((_.where(data, {email: contacts[i].email})).length === 0)
                    contactsNotRegistered.push(contacts[i]);
                }
                return callback();
              }
              else return callback();
            });
        },
        //****************************************************************//
        //* 2. ELIMINA DALL'INSERIMENTO GLI UTENTI CON CUI HO            *//
        //*    GIA' CONDIVISO L'APP                                      *//
        //****************************************************************//
        function (callback) {
          if (contactsNotRegistered.length > 0) {

            var emailContacts = _.map(contactsNotRegistered, 'email');

            Shareapp
              .find({id_user: idUser, contact: emailContacts})
              .exec(function (error, data) {
                if (error) return callback(error);
                else {
                  for (var i = 0; i < contactsNotRegistered.length; i++) {
                    if (data.length > 0) {
                      if ((_.where(data, {contact: contactsNotRegistered[i].email})).length == 0)
                        prepareInsertDocs.push({
                          id_user: idUser,
                          firstname: contactsNotRegistered[i].firstname,
                          lastname: contactsNotRegistered[i].lastname,
                          contact: contactsNotRegistered[i].email
                        });
                    }
                    else prepareInsertDocs.push({
                      id_user: idUser,
                      firstname: contactsNotRegistered[i].firstname,
                      lastname: contactsNotRegistered[i].lastname,
                      contact: contactsNotRegistered[i].email
                    });
                  }
                  return callback();
                }
              });
          }
          else return res.status(401).json({message: 'I contatti selezionati sono già registrati.'});
        },
        //****************************************************************//
        //* 3. INSERIMENTO E/O INVIO EMAIL AI CONTATTI SELEZIONATI       *//
        //****************************************************************//
        function (callback) {

          var emailContacts = _.map(contactsNotRegistered, 'email');

          if (prepareInsertDocs.length > 0) {
            Shareapp
              .create(prepareInsertDocs)
              .exec(function (error, data) {
                if (error) return callback(error);
                else EmailService.ShareAppWithContacts(res, emailContacts);
              });
          }
          else EmailService.ShareAppWithContacts(res, emailContacts);
        }
      ],
      function (error) {
        if (error) return res.serverError({message: error});
      }
    );
  }

};
