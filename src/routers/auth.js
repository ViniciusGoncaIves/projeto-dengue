const controller = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

module.exports = (app) => {
    app.post('/auth/login', /* #swagger.tags = ['Auth'] */ controller.PostLogin);
    app.get(
        '/auth/me',
        authMiddleware,
        /*
            #swagger.tags = ['Auth']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetMe,
    );
};
