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
      model: 'user'
    },
    id_friend: {
      model: 'user'
    },
    canEarnCredits: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  InsertFriendsOnUserRegistration: function (res, user, friends) {

    var prepareInsert = [];
    for (var i = 0; i < friends.length; i++) {
      prepareInsert.push({id_user: friends[i].id_user, id_friend: user.id});
      prepareInsert.push({id_user: user.id, id_friend: friends[i].id_user});
    }
    prepareInsert[0].canEarnCredits = true;

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
      .find({id_user: idUser})
      .populate('id_friend')
      .exec(function (error, data) {
        if (error) res.serverError({message: error});
        else {
          for (var i = 0; i < data.length; i++) {
            dataToShow.push({
              id: data[i].id_friend.id,
              firstname: data[i].id_friend.firstname,
              lastname: data[i].id_friend.lastname,
              image: data[i].id_friend.image,
              canEarnCredits: data[i].canEarnCredits
            })
          }
          res.ok({'data': dataToShow});
        }
      });
  }

};
