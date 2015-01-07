var nodemailer = require('nodemailer');
// LOAD MODEL
// ==============================================
var Shareapp = require('../models/shareAppModel');

exports.shareApp = function (req, res) {

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'gabriel.mayta@hotel-net.it',
            pass: 'perucampeon1984@'
        }
    });

    var emailsTo = req.body.emailTo;

    var mailOptions = {
        from: req.body.firstname + ' ' + req.body.lastname + '<' + req.body.emailFrom + '>',
        to: emailsTo,
        subject: "Condividi questa fantastica app (TEST)",
        html: "<b>Scarica questa app al seguente link</b><br/><a href=\"http://gabrielmayta.it/test/Oler-release.apk\">Oler-test</a>"
    };

    transporter.sendMail(mailOptions, function (error) {
        if (error) {
            res
                .status(500)
                .json({message: 'Problemi con i server interni, riprovare più tardi!'});
        } else {


            for (var emailTo in emailsTo) {
                var query = new Shareapp({
                    email: emailsTo[emailTo],
                    id_user: req.body.id_user
                });

                query.save(function (error) {
                    if (error)
                        res
                            .status(500)
                            .json({message: 'Problemi con i server interni, riprovare più tardi!'});
                    else {
                        res
                            .status(201)
                            .json({
                                data: {
                                    message: 'Risorsa inserità con successo'
                                }
                            });
                    }
                });
            }

            res
                .status(200)
                .json({data: {message: 'Grazie per aver condiviso l\'app'}});
        }
    });

};