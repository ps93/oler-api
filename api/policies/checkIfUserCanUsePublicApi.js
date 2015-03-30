module.exports = function (req, res, next) {

  var headers = req.headers;
  var PUBLIC_API_KEY = 'AAF56E987AC1CE78CD216BFA5727E';

  if (headers.authorization === PUBLIC_API_KEY) {
    next();
  }
  else res.status(401).json({message: 'Non sei autorizzato a fare questo tipo di richiesta.'});

};
