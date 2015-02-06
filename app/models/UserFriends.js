var db = require('mongoose'),
    Schema = db.Schema,
    Async = require('async'),
    _ = require('underscore'),
    UserModel = require('../models/User'),
    User = UserModel.Model();

var userFriendsSchema = new Schema({
    id_user: {type: String, unique: true, required: true},
    friends: [{
        id_friend: String,
        date: {type: Date, default: new Date()},
        canEarnCredits: {type: Boolean, default: false}
    }],
    created_at: {type: Date, default: new Date()}
});

var self = {

    Model: function () {
        return db.model('userfriends', userFriendsSchema);
    },

    CreateFriendListOnUserRegistration: function (res, userCreated, friends) {

        var Userfriends = self.Model();
        var friendsArray = _.pluck(friends, 'id_user');
        var prepareFriendList = [];

        for (var i = 0; i < friendsArray.length; i++) {
            prepareFriendList.push({id_friend: friendsArray[i]});
        }
        prepareFriendList[0].canEarnCredits = true;

        Userfriends({
            id_user: userCreated._id,
            friends: prepareFriendList
        }).save(function () {
            res.status(201).json({data: userCreated});
        });
    },

    UserFriendList: function (res, idUser) {

        var Userfriends = self.Model();
        var friendsIDs;

        Async.series([
            /****************************************************************/
            /* 1. RICAVA TUTI GLI id_friend DELLA LISTA AMICI DELL'UTENTE   */
            /****************************************************************/
            function (callback) {
                Userfriends
                    .findOne()
                    .where('id_user').equals(idUser)
                    .select('friends.id_friend')
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else if (data) {
                            friendsIDs = _.pluck(data.friends, 'id_friend');
                            return callback();
                        }
                        else res.status(404).json({message: 'non hai amici.'});
                    });
            },
            /****************************************************************/
            /* 2. RICAVA I DATI DEI MIEI AMICI                              */
            /****************************************************************/
            function (callback) {
                User
                    .find()
                    .where('_id').in(friendsIDs)
                    .select('firstname lastname email image')
                    .exec(function (error, data) {
                        if (error) return callback({status: 500, message: error});
                        else res.status(200).json({data: data});
                    });
            }
        ], function (error) {
            if (error) res.status(error.status).json({error: {message: error.message}});
        });

    }

};

module.exports = self;