const usuarioRoute = require("./usuario");
const denunciaRoute = require("./denuncia");
const authRoute = require("./auth");

module.exports = (app) => {
    usuarioRoute(app);
    denunciaRoute(app);
    authRoute(app);
};
