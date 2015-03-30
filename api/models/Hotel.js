/**
 * Hotel.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'hotels',

  attributes: {

    id: {
      type: 'string',
      primaryKey: true,
      required: true
    },
    middleware_code: 'string',
    provider_code: 'string',
    name: {type: 'string', required: true},
    street_address: 'string',
    city: 'string',
    country: 'string',
    postal_code: 'string',
    latitude: 'string',
    longitude: 'string',
    email: 'string',
    phone: 'string',
    fax: 'string',
    image: 'string',
    photos: 'array',
    website: 'string',
    is_hotelnet: {
      type: 'boolean',
      required: true
    }
  },

  Insert: function (res, params) {
    Hotel
      .create(params).exec(function (error, data) {
        if (error) return res.serverError({'message': error});
        else return res.ok({'data': data});
      });
  },

  HotelById: function (res, idHotel) {
    Hotel.findOne({id: idHotel}).exec(function (error, data) {
      if (error) return res.serverError({'message': error});
      else return res.ok({'data': data});
    });
  }

};

