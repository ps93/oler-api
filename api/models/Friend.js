/**
 * Friend.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'friends',

  attributes: {
    id_user: {
      model: 'user',
      required: true
    },
    id_friend: {
      model: 'user',
      required: true
    },
    can_earn_credits: {
      type: 'boolean',
      defaultsTo: false
    },
    are_friends: {
      type: 'boolean',
      required: true
    }
  },

  InsertFriendsOnUserRegistration: function (res, user, friends) {

    var prepareInsert = [];
    for (var i = 0; i < friends.length; i++) {
      prepareInsert.push({id_user: friends[i].id_user, id_friend: user.id, are_friends: true});
      /*prepareInsert.push({id_user: user.id, id_friend: friends[i].id_user});*/
    }
    prepareInsert[0].can_earn_credits = true;

    Friend
      .create(prepareInsert)
      .exec(function (error) {
        if (error) return res.serverError({message: error});
        else {
          HotelnetService
            .FriendsSync(prepareInsert[0].id_user, prepareInsert[0].id_friend,
            function (error, data) {
              if (error) return res.ok({data: user, error: error});
              else return res.ok({data: user, hn: data});
            })
        }
      });

  },

  MyFriends: function (res, idUser) {

    var friends = [];

    async.series([
      //LISTA AMICI
      function (callback) {
        Friend
          .find({or: [{id_user: idUser}, {id_friend: idUser}]})
          .populate('id_user')
          .populate('id_friend')
          .exec(function (error, data) {
            if (error) return callback(error);
            else {
              var friendsFromLeft = _.map(data, 'id_user');
              var friendsFromRight = _.map(data, 'id_friend');

              for (var i = 0; i < data.length; i++) {
                if (data[i].id_user.id !== idUser) {
                  data[i].id_user.cash = false;
                  data[i].id_user.arefriends = data[i].are_friends;
                  data[i].id_user.pending = false;
                  friends.push(data[i].id_user);
                }
                if (data[i].id_friend.id !== idUser) {
                  data[i].id_friend.cash = data[i].can_earn_credits;
                  data[i].id_friend.arefriends = data[i].are_friends;
                  data[i].id_friend.pending = false;
                  friends.push(data[i].id_friend);
                }
              }
              return callback();
            }
          });
      },
      // LISTA CONTATTI INVITATI
      function (callback) {
        var emailFriends = _.map(friends, 'email');
        Shareapp.find({
          id_user: idUser,
          contact: {'!': emailFriends}
        }).exec(function (error, data) {
          if (error) return callback(error);
          else {
            if (data.length > 0) {
              for (var i = 0; i < data.length; i++) {
                data[i].cash = false;
                data[i].pending = true;
                data[i].email = data[i].contact;
                delete data[i].contact;
                friends.push(data[i]);
              }
            }
            return res.ok({data: friends});
          }
        });
      }
    ], function (error, responses) {
      if (error) return res.serverError({message: error});
    });
  },

  AddFakeFriend: function (res, idUser, idFriend) {
    async.series([
      function (callback) {
        Friend
          .update({id_user: idUser, id_friend: idFriend}, {are_friends: true})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) return res.ok({data: data});
            else return callback();
          });
      },
      function (callback) {
        Friend
          .update({id_user: idFriend, id_friend: idUser}, {are_friends: true})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) return res.ok({data: data});
            else return res.status(401).json({message: 'L\'utente non è stato trovato!'});
          });
      }
    ], function (error, responses) {
      if (error) return res.serverError({message: error});
    });

  },

  RemoveFakeFriend: function (res, idUser, idFriend) {
    var userFound;

    //****************************************************************//
    //* 1. CONTROLLA SE L'UTENTE CHE SI VUOLE ELIMINARE E' UN AMICO  *//
    //****************************************************************//
    async.series([
      function (callback) {

        Friend
          .findOne([
            {or: [{id_user: idUser, id_friend: idFriend}]},
            {or: [{id_user: idFriend, id_friend: idUser}]}
          ])
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (!_.isEmpty(data)) {
              userFound = data;
              return callback();
            }
            else return res.status(401).json({message: 'L\'utente non è stato trovato!'});
          });
      },

      //****************************************************************//
      //* 2. CONTROLLA CHE L'UTENTE CHE SI VUOLE ELIMINARE NON SIA UN  *//
      //*    AMICO CHE FA GUADAGNARE                                   *//
      //****************************************************************//
      function (callback) {
        if (!userFound.can_earn_credits) {
          Friend
            .destroy({id: userFound.id})
            .exec(function (error, data) {
              if (error) return callback(error);
              else return res.ok({data: data});
            });
        }
        else return callback();
      },

      //****************************************************************//
      //* 3. SE E' UN AMICO CHE FA GUADAGNARE ALLORA 'are_friends'     *//
      //*    VIENE SETTATO A FALSE                                     *//
      //****************************************************************//
      function (callback) {
        Friend
          .update({id: userFound.id}, {are_friends: false})
          .exec(function (error, data) {
            if (error) return callback(error);
            else return res.ok({data: data});
          });
      }
    ], function (error, responses) {
      if (error) return res.serverError({message: error});
    });
  },

  AddFriendOnRequest: function (res, idUser, contacts) {

    var checkIfUserhasFriend_A = [];
    var checkIfUserhasFriend_B = [];
    var tempUsers = [];
    var prepareInsert = [];

    async.series([

      //****************************************************************//
      //* 1. DALLA RICHIESTA CONTROLLA SE CI SONO UTENTI REGISTRATI    *//
      //****************************************************************//
      function (callback) {

        var emailContacts = _.map(contacts, 'email');

        User
          .find({email: emailContacts})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) {
              for (var i = 0; i < data.length; i++) {
                checkIfUserhasFriend_A.push({
                  id_user: idUser,
                  id_friend: data[i].id
                });
                checkIfUserhasFriend_B.push({
                  id_user: data[i].id,
                  id_friend: idUser
                });
                tempUsers.push({
                  id_user: idUser,
                  id_friend: data[i].id
                });
              }
              return callback();
            }
            else res.status(401).json({message: 'Gli utenti selezionati non sono ancora registrati!'})
          });
      },

      //****************************************************************//
      //* 2. PREPARA LA RICHIESTA PER L'INSERIMENTO DEGLI AMICI        *//
      //****************************************************************//
      function (callback) {
        Friend
          .find([{or: checkIfUserhasFriend_A}, {or: checkIfUserhasFriend_B}])
          .exec(function (error, data) {

            if (error) return callback(error);

            else if (data.length > 0) {
              _.forEach(tempUsers, function (item) {
                if ((_.where(data, {id_user: item.id_user, id_friend: item.id_friend})).length === 0
                  && (_.where(data, {id_user: item.id_friend, id_friend: item.id_user})).length === 0) {
                  prepareInsert.push({
                    id_user: idUser,
                    id_friend: (item.id_user === idUser) ? item.id_friend : item.id_user,
                    are_friends: true
                  });
                }
              });
              return callback();
            }

            else {
              _.forEach(tempUsers, function (item) {
                prepareInsert.push({
                  id_user: idUser,
                  id_friend: item.id_friend,
                  are_friends: true
                });
              });

              return callback();
            }
          });
      },

      //****************************************************************//
      //* 3. INSERIMENTO DEGLI AMICI    *//
      //****************************************************************//
      function (callback) {

        if (prepareInsert.length > 0) {
          Friend
            .create(prepareInsert)
            .exec(function (error, data) {
              if (error) return res.serverError({message: error});
              else return res.ok({data: data});
            });
        }
        else return res.status(401).json({message: 'Gli utenti che hai selezionato sono già tra i tuoi amici!'})

      }
    ], function (error) {
      if (error) return res.serverError({message: error});
    });

  }

};
