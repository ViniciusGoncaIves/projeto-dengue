const usuarioRoute = require("./usuario");
const denunciaRoute = require("./denuncia");
const authRoute = require("./auth");
const filesRoute = require("./files");

module.exports = (app, upload) => {
    usuarioRoute(app);
    denunciaRoute(app, upload);
    authRoute(app);
    filesRoute(app, upload);
};
