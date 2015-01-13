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
            hotel_code: String,
            place_id: String,
            name: String,
            street: String,
            city: String,
            country: String
        }
    ],
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: Date
});

module.exports = db.model('hotelFavourites', hotelFavouritesSchema);