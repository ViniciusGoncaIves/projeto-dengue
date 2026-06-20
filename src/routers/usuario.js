const controller = require("../controllers/usuario");
const authMiddleware = require("../middlewares/auth");

module.exports = (app) => {
    app.get(
        "/usuario",
        authMiddleware,
        /*
            #swagger.tags = ['Usuarios']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetUsuario,
    );
    app.get(
        "/usuario/:id",
        authMiddleware,
        /*
            #swagger.tags = ['Usuarios']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetUsuarioById,
    );
    app.delete(
        "/usuario/:id",
        authMiddleware,
        /*
            #swagger.tags = ['Usuarios']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.DeleteUsuarios,
    );
    app.post("/usuario", /* #swagger.tags = ['Usuarios'] */ controller.PostUsuario);
    app.put(
        "/usuario/:id",
        authMiddleware,
        /*
            #swagger.tags = ['Usuarios']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.PutUsuario,
    );
};
