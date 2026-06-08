const controller = require('../controllers/auth');
const authMiddleware = require('../middlewares/auth');

module.exports = (app) => {
    app.post('/auth/login', controller.PostLogin);
    app.get('/auth/me', authMiddleware, controller.GetMe);
};
