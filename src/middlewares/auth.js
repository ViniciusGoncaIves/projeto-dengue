const authService = require('../services/auth');
const usuarioService = require('../services/usuario');
const { logError, logWarning } = require('../utils/logger');

/**
 * Função de autenticação.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function authenticate(req, res, next) {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            logWarning('Requisicao sem token de autorizacao', {
                method: req.method,
                originalUrl: req.originalUrl,
            });
            return res.status(401).json({ error: 'Não autorizado' });
        }

        const userId = authService.verifyToken(token);
        const usuario = await usuarioService.GetUsuarioById(userId);
        if (!usuario) {
            logWarning('Token valido sem usuario correspondente', {
                method: req.method,
                originalUrl: req.originalUrl,
                userId,
            });
            return res.status(401).json({ error: 'Não autorizado' });
        }
        req.user = usuario;

        next();
    } catch (error) {
        logError('authenticate falhou', error, req);
        return res.status(401).json({ error: 'Token Inválido ou expirado' });
    }
}

module.exports = authenticate;
