const exampleRoute = require('./example');
const usuarioRoute = require('./usuario');

module.exports = (app) => {
  exampleRoute(app);
  usuarioRoute(app);
}