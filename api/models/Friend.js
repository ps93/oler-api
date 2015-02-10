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
    }
    prepareInsert[0].canEarnCredits = true;

    Friend
      .create(prepareInsert)
      .exec(function (error) {
        if (error) return res.serverError({message: error});
        else return res.ok({'data': user});
      });
  },

  MyFriends: function (res, idUser) {

    async.parallel([
        function (callback) {
          Friend
            .find({id_user: idUser})
            .populate('id_friend')
            .exec(function (error, data) {
              if (error) return callback(error);
              else return callback(null, data);
            });
        },
        function (callback) {
          Friend
            .find({id_friend: idUser})
            .populate('id_user')
            .exec(function (error, data) {
              if (error) return callback(error);
              else return callback(null, data);
            });
        }
      ],
      function (error, responses) {
        if (error) return res.serverError({message: error});
        else if (responses[0].length > 0 || responses[1].length > 0) {
          var dataToShow = [];
          for (var i = 0; i < responses[0].length; i++) {
            dataToShow.push({
              id: responses[0][i].id_friend.id,
              firstname: responses[0][i].id_friend.firstname,
              lastname: responses[0][i].id_friend.lastname,
              email: responses[0][i].id_friend.email,
              image: responses[0][i].id_friend.image,
              canEarnCredits: responses[0][i].canEarnCredits,
              createdAt: responses[0][i].createdAt
            });
          }
          for (var i = 0; i < responses[1].length; i++) {
            dataToShow.push({
              id: responses[1][i].id_user.id,
              firstname: responses[1][i].id_user.firstname,
              lastname: responses[1][i].id_user.lastname,
              email: responses[1][i].id_user.email,
              image: responses[1][i].id_user.image,
              canEarnCredits: false,
              createdAt: responses[1][i].createdAt
            });
          }
          return res.ok({data: dataToShow});
        }
        else return res.ok({message: 'Non hai amici.'});
      });
  }

};
