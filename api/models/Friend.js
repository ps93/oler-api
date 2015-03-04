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
        if (error) res.serverError({message: error});
        else res.ok({'data': user});
      });
  },

  MyFriends: function (res, idUser) {

    var dataToShow = [];
    Friend
      .find({or: [{id_user: idUser}, {id_friend: idUser}]})
      .populate('id_user')
      .populate('id_friend')
      .exec(function (error, data) {
        if (error) res.serverError({message: error});
        else {
          var dataToShow = [];
          var friendsFromLeft = _.map(data, 'id_user');
          var friendsFromRight = _.map(data, 'id_friend');

          for (var i = 0; i < data.length; i++) {
            if (data[i].id_user.id !== idUser)
              dataToShow.push(data[i].id_user);
            if (data[i].id_friend.id !== idUser)
              dataToShow.push(data[i].id_friend);
          }
          res.ok({'data': dataToShow});
        }
      });
  }

};
