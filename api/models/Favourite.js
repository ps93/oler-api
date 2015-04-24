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

  Insert: function (res, idUser, idHotel, params) {

    async.series([
      function (callback) {
        Favourite
          .find({id_user: idUser, id_hotel: idHotel})
          .exec(function (error, data) {
            if (error) callback(error);
            else if (data.length > 0) res.status(401).json({message: 'L\'hotel è già tra i tuoi preferiti'});
            else callback();
          });
      },
      function (callback) {
        Hotel
          .findOrCreate({id: idHotel}, {
            id: idHotel,
            middleware_code: params.middleware_code,
            provider_code: params.provider_code,
            name: params.name,
            street_address: params.street_address,
            city: params.city,
            country: params.country,
            postal_code: params.postal_code,
            latitude: params.latitude,
            longitude: params.longitude,
            email: params.email,
            phone: params.phone,
            fax: params.fax,
            image: params.image,
            photos: params.photos,
            website: params.website,
            stars: params.stars,
            is_hotelnet: params.is_hotelnet
          })
          .exec(function (error) {
            if (error) callback(error);
            else callback();
          });
      },
      function (callback) {
        Favourite
          .create({id_user: idUser, id_hotel: idHotel})
          .exec(function (error, data) {
            if (error) callback(error);
            else res.ok({data: sails.__({phrase: 'add_hotel_favourites', locale: 'it'})});
          });
      }
    ], function (error) {
      if (error) res.serverError({'message': error});
    });

  },

  Remove: function (res, idUser, idHotel) {
    Favourite
      .destroy({id_user: idUser, id_hotel: idHotel})
      .exec(function (error, data) {
        if (error) callback(error);
        else if (data.length > 0) res.ok({data: 'L\'hotel è stato eliminato dai tuoi preferiti.'});
        else res.status(404).json({message: 'L\'hotel selezionato non è presente tra i preferiti'});
      });
  },

  MyFavourites: function (res, idUser) {
    Favourite
      .find({id_user: idUser})
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error)  return res.serverError({message: error});
        else if (data.length > 0) return res.ok({data: _.sortBy(_.map(data, 'id_hotel'), 'name')});
        else return res.ok({data: []});
      });
  }

};

