const authService = require("../services/auth");
const usuarioService = require("../services/usuario");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
async function PostLogin(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: "Email ou senha não informados" });
    }
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: "Email ou senha não informados" });
    }

    const usuario = await usuarioService.GetUsuarioLogin(email);
    if (!usuario) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const senhaCorreta = await authService.verifyPassword(senha, usuario.senha);

    if (!senhaCorreta) {
        return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = authService.generateToken(usuario.idusuario);

    res.cookie("auth_dengue", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ message: "Sucesso na autenticação" });
}

module.exports = {
    PostLogin,
};
