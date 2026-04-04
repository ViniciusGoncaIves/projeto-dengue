const controller = require("../controllers/denuncia");
const authMiddleware = require("../middlewares/auth");

module.exports = (app) => {
	app.get("/denuncia", authMiddleware, controller.GetDenuncia);
	app.get("/denuncia/:id", authMiddleware, controller.GetDenunciaById);
	app.post("/denuncia", controller.PostDenuncia);
	app.put("/denuncia/:id", authMiddleware, controller.PutDenuncia);
	app.delete("/denuncia/:id", authMiddleware, controller.DeleteDenuncia);
}