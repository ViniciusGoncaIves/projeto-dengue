const usuarioService = require('../services/usuario');
const authService = require('../services/auth');
const { logError } = require('../utils/logger');

const TIPOS_USUARIO = ['USER', 'ADMIN'];

function isAdmin(req) {
    return req.user?.tipo === 'ADMIN';
}

function adminOnly(res) {
    return res.status(403).json({
        status: 'error',
        message: 'Acesso permitido somente para administradores',
    });
}

async function GetUsuario(req, res) {
    try {
        if (!isAdmin(req)) {
            return adminOnly(res);
        }

        const usuarios = await usuarioService.GetUsuario();
        return res.status(200).json({
            status: 'ok',
            data: usuarios,
        });
    } catch (error) {
        logError('GetUsuario falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function GetUsuarioById(req, res) {
    const { id } = req.params;
    try {
        if (!isAdmin(req)) {
            return adminOnly(res);
        }

        const usuario = await usuarioService.GetUsuarioById(id);
        if (!usuario) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado',
            });
        }
        return res.status(200).json({
            status: 'ok',
            data: usuario,
        });
    } catch (error) {
        logError('GetUsuarioById falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function DeleteUsuarios(req, res) {
    const { id } = req.params;
    try {
        if (!isAdmin(req)) {
            return adminOnly(res);
        }

        if (Number(id) === req.user?.idusuario) {
            return res.status(409).json({
                status: 'error',
                message: 'Você não pode remover sua própria conta',
            });
        }

        const result = await usuarioService.GetUsuarioById(id);
        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado',
            });
        }
        await usuarioService.DeleteUsuario(id);
        return res.status(200).json({
            status: 'ok',
            message: 'Usuário deletado com sucesso',
            data: result,
        });
    } catch (error) {
        logError('DeleteUsuarios falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PostUsuario(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios faltando',
            });
        }

        const usuarioExistente = await usuarioService.GetUsuarioLogin(email);
        if (usuarioExistente) {
            return res.status(409).json({
                status: 'error',
                message: 'E-mail já cadastrado',
            });
        }

        const senhaEncriptada = await authService.hashPassword(senha);
        const usuario = await usuarioService.PostUsuario({
            nome,
            email,
            senha: senhaEncriptada,
            tipo: 'USER',
        });

        return res.status(201).json({
            status: 'ok',
            message: 'Usuário cadastrado com sucesso',
            data: usuario,
        });
    } catch (error) {
        logError('PostUsuario falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PostUsuarioAdmin(req, res) {
    try {
        if (!isAdmin(req)) {
            return adminOnly(res);
        }

        const { nome, email, senha, tipo = 'USER' } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios faltando',
            });
        }

        if (!TIPOS_USUARIO.includes(tipo)) {
            return res.status(400).json({
                status: 'error',
                message: 'Tipo de usuário inválido',
            });
        }

        const usuarioExistente = await usuarioService.GetUsuarioLogin(email);
        if (usuarioExistente) {
            return res.status(409).json({
                status: 'error',
                message: 'E-mail já cadastrado',
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
            status: 'ok',
            message: 'Usuário cadastrado com sucesso',
            data: usuario,
        });
    } catch (error) {
        logError('PostUsuarioAdmin falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PutUsuario(req, res) {
    const { id } = req.params;

    try {
        if (!isAdmin(req)) {
            return adminOnly(res);
        }

        const { nome, email, senha, tipo } = req.body;

        if (!nome || !email || !tipo) {
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios faltando',
            });
        }

        if (!TIPOS_USUARIO.includes(tipo)) {
            return res.status(400).json({
                status: 'error',
                message: 'Tipo de usuário inválido',
            });
        }

        const usuarioExistente = await usuarioService.GetUsuarioById(id);
        if (!usuarioExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado',
            });
        }

        const usuarioMesmoEmail = await usuarioService.GetUsuarioLogin(email);
        if (usuarioMesmoEmail && usuarioMesmoEmail.idusuario !== Number(id)) {
            return res.status(409).json({
                status: 'error',
                message: 'E-mail já cadastrado',
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
            status: 'ok',
            message: 'Usuário atualizado com sucesso',
            data: usuario,
        });
    } catch (error) {
        logError('PutUsuario falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

module.exports = {
    GetUsuario,
    GetUsuarioById,
    DeleteUsuarios,
    PostUsuario,
    PostUsuarioAdmin,
    PutUsuario,
};
