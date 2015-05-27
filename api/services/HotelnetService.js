module.exports = {

  HotelnetRegistrationPrepare: function (howUserRegistered, params, password) {
    // 1 = email | 2 = facebook | 3 = google
    return JSON.stringify({
      'channel_code': '0202',
      'id_user': params.id,
      'username': params.email,
      'email': params.email,
      'password': password,
      'name': params.firstname,
      'surname': params.lastname,
      'how_user_registered': howUserRegistered
    });
  },

  HotelnetRegistrationOptions: function (requestPrepared) {
    return {
      hostname: 'webservice.hotelnet.biz',
      path: '/ws/Hotelnet.Services/api/user_new',
      port: 443,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestPrepared.length
      }
    };
  },

  CalculateCredits: function (total, percentage) {
    return ((total * percentage) / 100).toFixed(2);
  }

};
