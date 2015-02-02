var db = require('mongoose'),
    Schema = db.Schema;

var userSchema = new Schema({
    access: [
        {
            code: String,
            name: {type: String, enum: ['email', 'facebook', 'google'], required: true},
            token: {type: String},
            created_at: {type: Date, default: new Date()},
            updated_at: Date
        }
    ],
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    image: String,
    points: {
        type: Number,
        default: 2
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: Date
});

var User = module.exports = db.model('users', userSchema);

User.schema.path('email').validate(function (value, res) {
    User.findOne({email: value}, 'email', function (err, data) {
        res(data ? false : true);
    })
}, 'email_is_present');