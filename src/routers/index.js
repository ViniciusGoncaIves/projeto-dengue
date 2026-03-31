const usuarioRoute = require("./usuario");
const authRoute = require("./auth");

module.exports = (app) => {
    usuarioRoute(app);
    authRoute(app);
};
