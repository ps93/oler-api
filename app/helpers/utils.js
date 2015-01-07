var Nodemailer = require('nodemailer');

exports.validateFields = function (fields, data) {
    var isValid = false;
    /*CHECK FIELDS*/
    for (var field in fields) {
        var checKField = fields[field].split('.');
        if (checKField.length === 1
            && data.hasOwnProperty(checKField[0])
            && data[checKField[0]]
            && data[checKField[0]].trim()) {
            isValid = true;
        }
        else if (checKField.length > 1
            && data.hasOwnProperty(checKField[0])) {
            var check_2 = data[checKField[0]];
            if (check_2.hasOwnProperty(checKField[1])
                && check_2[checKField[1]]
                && check_2[checKField[1]].trim()) {
                isValid = true;
            } else {
                isValid = false;
                break;
            }
        }
        else {
            isValid = false;
            break;
        }
    }
    return isValid;
};

exports.emailConfiguration = function () {

    var config = Nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'gabriel.mayta@hotel-net.it',
            pass: 'perucampeon1984@'
        }
    });

    return config;
};