const controller = require('../controllers/usuario');

module.exports = (app) => {
    app.get('/usuario', controller.GetUsuario);
    app.get('/usuario/:id', controller.GetUsuarioById);
    app.delete('/usuario/:id', controller.DeleteUsuarios);
    app.post('/usuario', controller.PostUsuario);
}