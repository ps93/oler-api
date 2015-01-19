var db = require('mongoose'),
    Schema = db.Schema;

var hotelsworldSchema = new Schema({
    hotelCodes: {
        google_key: {type: String, required: true},
        absoluteCode: {type: String},
        middleware_code: {type: String},
        provider_code: {type: String}
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }
});

module.exports = db.model('hotelsworld', hotelsworldSchema);