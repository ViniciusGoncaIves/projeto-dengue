const usuarioService = require("../services/usuario");
const authService = require("../services/auth");

async function GetUsuario(req, res) {
    try {
        const usuarios = await usuarioService.GetUsuario();
        return res.status(200).json({
            status: "ok",
            data: usuarios,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro do servidor",
            error: error.message,
        });
    }
}

async function GetUsuarioById(req, res) {
    const { id } = req.params;
    try {
        const usuario = await usuarioService.GetUsuarioById(id);
        if (!usuario) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
            });
        }
        return res.status(200).json({
            status: "ok",
            data: usuario,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro do servidor",
            error: error.message,
        });
    }
}

async function DeleteUsuarios(req, res) {
    const { id } = req.params;
    try {
        const result = await usuarioService.GetUsuarioById(id);
        if (!result) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
            });
        }
        await usuarioService.DeleteUsuario(id);
        return res.status(200).json({
            status: "ok",
            message: "Usuário deletado com sucesso",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro do servidor",
            error: error.message,
        });
    }
}

async function PostUsuario(req, res) {
    try {
        const { nome, email, senha, tipo } = req.body;

        if (!nome || !email || !senha || !tipo) {
            return res.status(400).json({
                status: "error",
                message: "Campos obrigatórios faltando",
            });
        }

        const senhaEncriptada = await authService.hashPassword(senha);
        const usuario = await usuarioService.PostUsuario({
            nome,
            email,
            senha: senhaEncriptada,
            tipo,
        });

        return res.status(201).json({
            status: "ok",
            message: "Usuário cadastrado com sucesso",
            data: usuario,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro do servidor",
            error: error.message,
        });
    }
}

async function PutUsuario(req, res) {
    const { id } = req.params;

    try {
        const { nome, email, senha, tipo } = req.body;

        const usuarioExistente = await usuarioService.GetUsuarioById(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                status: "error",
                message: "Usuário não encontrado",
            });
        }

        let senhaEncriptada = null;
        if (senha) {
            senhaEncriptada = await authService.hashPassword(senha);
        }

        const usuario = await usuarioService.PutUsuario(id, {
            nome,
            email,
            senha: senhaEncriptada,
            tipo,
        });

        return res.status(200).json({
            status: "ok",
            message: "Usuário atualizado com sucesso",
            data: usuario,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro do servidor",
            error: error.message,
        });
    }
}

module.exports = {
    GetUsuario,
    GetUsuarioById,
    DeleteUsuarios,
    PostUsuario,
    PutUsuario,
};
