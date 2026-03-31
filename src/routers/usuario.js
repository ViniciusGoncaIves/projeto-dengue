const controller = require("../controllers/usuario");
const authMiddleware = require("../middlewares/auth");

module.exports = (app) => {
    app.get("/usuario", authMiddleware, controller.GetUsuario);
    app.get("/usuario/:id", authMiddleware, controller.GetUsuarioById);
    app.delete("/usuario/:id", authMiddleware, controller.DeleteUsuarios);
    app.post("/usuario", controller.PostUsuario);
};
