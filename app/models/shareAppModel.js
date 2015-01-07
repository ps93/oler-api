var db = require('mongoose');
var Schema = db.Schema;

var shareappSchema = new Schema({
    email: {
        type: String
    },
    id_user: {
        type: String
    },
    disabled: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }
});

module.exports = db.model('shareapp', shareappSchema);