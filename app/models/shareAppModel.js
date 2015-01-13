var db = require('mongoose');
var Schema = db.Schema;

var shareappSchema = new Schema({
    id_user: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    contacts: [
        {email: String, date: Date}
    ],
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date
    }
});

var ShareApp = module.exports = db.model('shareapp', shareappSchema);

ShareApp.schema.path('id_user').validate(function (value, res) {
    ShareApp.findOne({id_user: value}, 'id_user', function (err, data) {
        res(data ? false : true);
    })
}, 'id_user_is_present');

ShareApp.schema.path('email').validate(function (value, res) {
    ShareApp.findOne({email: value}, 'email', function (err, data) {
        res(data ? false : true);
    })
}, 'email_is_present');