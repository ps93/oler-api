var db = require('mongoose'),
    Schema = db.Schema;

var hotelFavouritesSchema = new Schema({
    id_user: {
        type: String,
        unique: true,
        required: true
    },
    hotelFavourites: [
        {
            google_key: String
        }
    ],
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: Date
});

module.exports = db.model('hotelFavourites', hotelFavouritesSchema);