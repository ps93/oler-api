var access = require('../app/controllers/access'),
    functionalities = require('../app/controllers/functionalities');

// ROUTES
// ==============================================
module.exports = function (router) {

    // LOGIN WITH EMAIL
    router.route('/login/email')
        .post(access.loginWithEmail);

    // REGISTRATION WITH EMAIL
    router.route('/registration/email')
        .post(access.registrationWithEmail);

    // REGISTRATION WITH SOCIAL
    router.route('/access/social')
        .post(access.accessWithSocial);

    // SET PASSWORD
    router.route('/set-password')
        .post(access.setPassword);

    router.route('/send-email')
        .post(functionalities.shareApp);

};