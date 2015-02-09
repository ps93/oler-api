/**
 * Recommended.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'recommended',

  attributes: {

    id_user: {
      model: 'user'
    },
    id_hotel: {
      model: 'hotel'
    },
    id_friend: {
      model: 'user'
    }
  },

  Insert: function (res, idUser, idHotel, friends) {

    var prepareInsertDocs = [];

    async.series([
      /****************************************************************/
      /* 1. VERIFICA SE L'HOTEL E' GIA' STATO CONSIGILIATO            */
      /*    DALLA STESSA PERSONA E LO RIMUOVE DALL'INSERIMENTO        */
      /****************************************************************/
      function (callback) {
        Recommended
          .find({id_user: idUser, id_hotel: idHotel, id_friend: friends})
          .exec(function (error, data) {
            if (error) return callback(error);
            else {
              for (var i = 0; i < friends.length; i++) {
                if (data.length > 0) {
                  if ((_.where(data, {id_friend: friends[i]})).length == 0) {
                    prepareInsertDocs.push({id_user: idUser, id_hotel: idHotel, id_friend: friends[i]});
                  }
                }
                else prepareInsertDocs.push({id_user: idUser, id_hotel: idHotel, id_friend: friends[i]});
              }
              return callback();
            }
          });
      },
      /****************************************************************/
      /* 2. INSERIMENTO DEL HOTEL CONSIGLIATO                         */
      /****************************************************************/
      function (callback) {
        if (prepareInsertDocs.length > 0) {
          Recommended
            .create(prepareInsertDocs)
            .exec(function (error) {
              if (error) return res.serverError({'message': error});
              else return res.ok({'data': 'L\'hotel è stato condiviso con i tuoi amici'});
            });
        }
        else return res.forbidden({'message': 'L\'hotel è già stato consigliato con questi amici'});
      }
    ], function (error) {
      if (error) return res.serverError({message: error});
    });
  },

  UserRecommended: function (res, idUser) {
    Recommended
      .find({id_user: idUser})
      .populate('id_hotel')
      .populate('id_friend')
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else {
          var dataToShow = [];
          var hotel_found = false;
          var hotel_pos = undefined;

          for (var i = 0; i < data.length; i++) {
            var friendsData = {
              id: data[i].id_friend.id, firstname: data[i].id_friend.firstname,
              lastname: data[i].id_friend.lastname, image: data[i].id_friend.image
            };

            for (var j = 0; j < dataToShow.length; j++) {
              if (data[i].id_hotel.id === dataToShow[j].id_hotel) {
                hotel_pos = j;
                hotel_found = true;
                break;
              }
            }
            if (hotel_found) {
              dataToShow[hotel_pos].friends.push(friendsData);
              hotel_pos = undefined;
              hotel_found = false;
            }
            else {
              dataToShow.push({
                id_hotel: data[i].id_hotel.id,
                name: data[i].id_hotel.name,
                image: data[i].id_hotel.image,
                friends: [friendsData]
              });
            }
          }
          return res.ok({data: data});
        }
      });
  },

  FriendsRecommended: function (res, idUser) {
    Recommended
      .find({id_friend: idUser, sort: 'id_hotel'})
      .populate('id_hotel')
      .populate('id_user')
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else {
          var dataToShow = [];
          var hotel_found = false;
          var hotel_pos = undefined;

          for (var i = 0; i < data.length; i++) {
            var friendsData = {
              id: data[i].id_user.id, firstname: data[i].id_user.firstname,
              lastname: data[i].id_user.lastname, image: data[i].id_user.image
            };

            for (var j = 0; j < dataToShow.length; j++) {
              if (data[i].id_hotel.id === dataToShow[j].id_hotel) {
                hotel_pos = j;
                hotel_found = true;
                break;
              }
            }
            if (hotel_found) {
              dataToShow[hotel_pos].friends.push(friendsData);
              hotel_pos = undefined;
              hotel_found = false;
            }
            else {
              dataToShow.push({
                id_hotel: data[i].id_hotel.id,
                name: data[i].id_hotel.name,
                image: data[i].id_hotel.image,
                friends: [friendsData]
              });
            }
          }
          return res.ok({data: dataToShow});
        }
      });
  }

};

