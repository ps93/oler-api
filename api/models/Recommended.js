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
    },
    status: {
      type: 'string',
      enum: ['pending', 'approved', 'denied'],
      defaultsTo: 'pending'
    }
  },

  Insert: function (res, req, idUser, idHotel, friends, params) {

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
      function (callback) {
        if (params.is_hotelnet) {
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
        }
        else callback();
      },
      /****************************************************************/
      /* 2.  INSERIMENTO DEL HOTEL CONSIGLIATO                         */
      /****************************************************************/
      function (callback) {
        if (prepareInsertDocs.length > 0) {
          Recommended
            .create(prepareInsertDocs)
            .exec(function (error) {
              if (error) return callback(error);
              else {
                NotificationsService.recommendedHotel(req, idUser, prepareInsertDocs, params);
                return res.ok({'message': 'L\'hotel è stato condiviso con i tuoi amici', data: prepareInsertDocs});
              }
            });
        }
        else return res.status(401).json({'message': 'L\'hotel è già stato consigliato con questi amici'});
      }
    ], function (error) {
      if (error) return res.serverError({message: error});
    });
  },

  FriendsRecommended: function (res, idUser) {
    Recommended
      .find({id_friend: idUser, status: 'pending'})
      .populate('id_hotel')
      .populate('id_user')
      .exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else {
          var dataToShow = _.groupBy(data, function (item) {
            return (item.id_hotel && item.id) ? item.id_hotel.id : undefined;
          });
          if (!_.isEmpty(dataToShow)) return res.ok({data: dataToShow});
          else return res.ok({data: []});
        }
      });
  },

  HotelsUsersRecommended: function (res, idUser) {
    Recommended
      .find({id_friend: idUser, status: 'approved'})
      .populate('id_user')
      .populate('id_hotel')
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else {
          var dataToShow = _.groupBy(data, function (item) {
            return (item.id_hotel && item.id) ? item.id_hotel.id : undefined;
          });
          if (!_.isEmpty(dataToShow)) return res.ok({data: dataToShow});
          else return res.ok({data: []});
        }
      });
  },

  ApprovedHotelRecommended: function (res, idHotel, idUser) {

    Recommended
      .update({
        id_friend: idUser,
        id_hotel: idHotel
      },
      {
        status: 'approved'
      })
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else if (data.length > 0) return res.ok({data: data});
        else return res.status(404).json({message: 'L\'hotel non è presente nella nostra base dati'});
      });
  },

  DeniedHotelRecommended: function (res, idHotel, idUser) {

    Recommended
      .update({
        id_friend: idUser,
        id_hotel: idHotel
      },
      {
        status: 'denied'
      })
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else if (data.length > 0) return res.ok({data: data});
        else return res.status(404).json({message: 'L\'hotel non è presente nella nostra base dati'});
      });
  },

  HotelUsersRecommended: function (res, idUser, idHotel) {
    Recommended
      .find({id_friend: idUser, id_hotel: idHotel, status: 'approved'})
      .populate('id_user')
      .exec(function (error, data) {
        if (error) return res.serverError({message: error});
        else return res.ok({data: data});
      });
  }

};

