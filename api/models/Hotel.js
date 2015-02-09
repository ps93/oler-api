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
    name: {
      type: 'string',
      required: true
    }
  },

  Insert: function (res, params) {

    Hotel
      .create(params)
      .exec(function (error, data) {
        if (error) {
          if (error.status === 400) return res.badRequest({'message': sails.__({phrase: 'bad_request', locale: 'it'})});
          else return res.serverError({'message': error});
        }
        else return res.ok({'data': data});
      });

  }

};

