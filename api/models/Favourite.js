/**
 * Favourite.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'favourites',

  attributes: {

    id_user: {
      model: 'user'
    },
    id_hotel: {
      model: 'hotel'
    }
  },

  Insert: function (res, idUser, idHotel, name) {

    async.series([
      function (callback) {
        Favourite
          .find({id_user: idUser, id_hotel: idHotel})
          .exec(function (error, data) {
            if (error) return callback(error);
            else if (data.length > 0) return res.forbidden({message: 'L\'hotel è già tra i tuoi preferiti'});
            else return callback();
          });
      },
      function (callback) {
        Hotel
          .findOrCreate({id: idHotel}, {id: idHotel, name: name})
          .exec(function (error) {
            if (error) return callback(error);
            else return callback();
          });
      },
      function (callback) {
        Favourite
          .create({id_user: idUser, id_hotel: idHotel})
          .exec(function (error, data) {
            if (error) return callback(error);
            else return res.ok({data: data});
          });
      }
    ], function (error) {
      if (error) return res.serverError({'message': error});
    });

  },

  Remove: function (res, idUser, idHotel) {
    Favourite
      .destroy({id_user: idUser, id_hotel: idHotel})
      .exec(function (error, data) {
        if (error) return callback(error);
        else if (data.length > 0) res.ok({data: 'L\'hotel è stato eliminato dai tuoi preferiti.'});
        else return res.notFound({message: 'L\'hotel selezionato non è presente tra i preferiti'});
      });
  },

  MyFavourites: function (res, idUser) {
    Favourite
      .find({id_user: idUser})
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error) return callback(error);
        else if (data.length > 0) {
          var dataToShow = [];
          for (var i = 0; i < data.length; i++) {
            dataToShow.push({
              id: data[i].id_hotel.id,
              name: data[i].id_hotel.name,
              image: data[i].id_hotel.image,
              createdAt: data[i].createdAt
            });
          }
          return res.ok({data: dataToShow});
        }
        else return res.ok({message: 'Nessun hotel tra i preferiti.'});
      });
  }

};

