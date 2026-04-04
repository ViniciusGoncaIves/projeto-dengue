const authService = require("../services/auth");
const usuarioService = require("../services/usuario");

/**
 * Função de autenticação.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function authenticate(req, res, next) {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Não autorizado" });
        }

        const userId = authService.verifyToken(token);
        const usuario = await usuarioService.GetUsuarioById(userId);
        req.user = usuario;

        next();
    } catch (error) {
        return res.status(401).json({ error: "Token Inválido ou expirado" });
    }
}

module.exports = authenticate;
