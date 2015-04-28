module.exports = {

  recommendedHotel: function (req, idUser, friends, hotel) {

    User
      .findOne({id: idUser})
      .exec(function (error, data) {
        console.log("Chiamata trova dati utente!");
        console.log(data);
        if (data) {
          for (var i = 0; i < friends.length; i++) {
            var socketUserID = friends[i].id_friend;
            console.log(socketUserID);
            sails.sockets.blast('recommendedHotel' + socketUserID, {
              data: {
                firstname: data.firstname,
                lastname: data.lastname,
                fullname: data.firstname + ' ' + data.lastname,
                image: data.image,
                hotel_name: hotel.name,
                hotel_image: hotel.image
              }
            }, req.socket);
          }
        }
      });

  }

};
