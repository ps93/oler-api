var Nodemailer = require('nodemailer');

module.exports = {

  EmailConfiguration: function () {
    return Nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'gabriel.mayta@hotel-net.it',
        pass: 'perucampeon1984@'
      }
    });
  },

  SendEmailSetPassword: function (res, password, emailTo) {
    var prepareEmail = {
      from: 'Oler Srl<oler@gmail.com>',
      to: emailTo,
      subject: 'Hai chiesto di resettare la password',
      html: "<p>Password temporanea</p><br/><b>" + password + "</b>"
    };

    var config = this.EmailConfiguration();

    config.sendMail(prepareEmail, function (error) {
      if (error) return res.serverError({message: error});
      else return res.ok({data: 'Ti è stata inviata una email con la password provvisoria da cambiare al primo accesso.'});
    });
  },

  ShareAppWithContacts: function (res, contacts, fullName) {

    contacts.push('gabriel.mayta@hotel-net.it');

    var prepareEmail = {
      from: 'Oler Srl<oler@gmail.com>',
      bcc: contacts,// PER MOTIVI DI PRIVACY
      subject: "Condividi questa fantastica app",
      html: fullName +" ha condiviso con te questa fantastica app, clicca sul link per scaricarla"
    };

    var config = this.EmailConfiguration();

    config.sendMail(prepareEmail, function (error) {
      if (error) return res.serverError({message: error});
      else return res.ok({data: 'L\'app è stata condivisa con i contatti selezionati.'});
    });
  }

};
