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
        else return res.ok({data: user});
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
    Friend.update({id_user: idUser, id_friend: idFriend}, {are_friends: true}).exec(function (error, data) {
      if (error) return res.serverError({message: error});
      else return res.ok({data: data});
    });
  },

  RemoveFakeFriend: function (res, idUser, idFriend) {
    Friend.update({id_user: idUser, id_friend: idFriend}, {are_friends: false}).exec(function (error, data) {
      if (error) return res.serverError({message: error});
      else return res.ok({data: data});
    });
  }

};
