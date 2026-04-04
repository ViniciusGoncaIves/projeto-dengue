const authService = require("../services/auth");
const usuarioService = require("../services/usuario");

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
    return res.status(200).json({ token });
}

module.exports = {
    PostLogin,
};
