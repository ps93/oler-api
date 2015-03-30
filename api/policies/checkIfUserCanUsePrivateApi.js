module.exports = function (req, res, next) {

  var headers = params.headers;
  var params = req.params;
  var PRIVATE_API_KEY = '88E82AB13D597D5A18E6EE61288CE';

  if (headers && headers.authorization === PRIVATE_API_KEY && headers.token) {
    User
      .findOne({token: token})
      .exec(function (error, data) {
        if(error) return res.serverError({message: error});
        else if(_.empty(data)){

        }
      });
    next();
  }
  else res.status(401).json({message: 'Non sei autorizzato a fare questo tipo di richiesta.'});

};
