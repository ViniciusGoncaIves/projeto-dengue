const denunciaService = require('../services/denuncia');
const authService = require('../services/auth');
const usuarioService = require('../services/usuario');
const fileService = require('../services/files');

async function GetDenuncia(req, res) {
    try {
        const isAdmin = req.user?.tipo === 'ADMIN';
        const limit = Number.isFinite(Number(req.query.limit))
            ? Number(req.query.limit)
            : undefined;
        const offset = Number.isFinite(Number(req.query.offset))
            ? Number(req.query.offset)
            : undefined;
        const status = req.query.status || undefined;

        const denuncias = await denunciaService.GetDenuncia({
            userId: req.user?.idusuario,
            isAdmin,
            status,
            limit,
            offset,
        });
        return res.status(200).json({
            status: 'ok',
            data: denuncias,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function GetDenunciaById(req, res) {
    const { id } = req.params;

    try {
        const denuncia = await denunciaService.GetDenunciaById(id);
        if (!denuncia) {
            return res.status(404).json({
                status: 'error',
                message: 'Denúncia não encontrada',
            });
        }

        return res.status(200).json({
            status: 'ok',
            data: denuncia,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PostDenuncia(req, res) {
    try {
        const { descricao, latitude, longitude, endereco, anonimo } = req.body;
        let idUsuario = null;

        if (!anonimo) {
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                if (!token) {
                    return res.status(401).json({ error: 'Token inválido' });
                }
                try {
                    const userId = authService.verifyToken(token);
                    const usuario = await usuarioService.GetUsuarioById(userId);
                    idUsuario = usuario?.idusuario || null;
                } catch (error) {
                    return res.status(401).json({ error: 'Token inválido' });
                }
            }
        }

        if (!descricao || latitude == null || longitude == null) {
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios faltando',
            });
        }

        const denuncia = await denunciaService.PostDenuncia({
            usuario_id: idUsuario,
            descricao,
            latitude,
            longitude,
            endereco,
        });

        const arquivos = req.files || [];
        const paths = [];
        for (const arquivo of arquivos) {
            const resultado = await fileService.uploadFile(arquivo);
            if (resultado.status === 'success') {
                paths.push(resultado.data.publicUrl);
            }
        }
        await denunciaService.AddDenunciaImagens(denuncia.iddenuncia, paths);

        return res.status(201).json({
            status: 'ok',
            message: 'Denúncia cadastrada com sucesso',
            data: denuncia,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PutDenuncia(req, res) {
    const { id } = req.params;

    try {
        const denunciaExistente = await denunciaService.GetDenunciaById(id);
        if (!denunciaExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Denúncia não encontrada',
            });
        }

        const { descricao, latitude, longitude, endereco, status, data_analise, motivo_rejeicao } =
            req.body;

        if (!descricao || latitude == null || longitude == null) {
            return res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios faltando',
            });
        }

        const denuncia = await denunciaService.PutDenuncia(id, {
            descricao,
            latitude,
            longitude,
            endereco,
            status,
            data_analise,
            motivo_rejeicao,
        });

        return res.status(200).json({
            status: 'ok',
            message: 'Denúncia atualizada com sucesso',
            data: denuncia,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function DeleteDenuncia(req, res) {
    const { id } = req.params;

    try {
        const denunciaExistente = await denunciaService.GetDenunciaById(id);
        if (!denunciaExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Denúncia não encontrada',
            });
        }

        const denuncia = await denunciaService.DeleteDenuncia(id);
        return res.status(200).json({
            status: 'ok',
            message: 'Denúncia deletada com sucesso',
            data: denuncia,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function GetDenunciaStats(req, res) {
    try {
        const isAdmin = req.user?.tipo === 'ADMIN';
        const stats = await denunciaService.GetDenunciaStats({
            userId: req.user?.idusuario,
            isAdmin,
        });

        return res.status(200).json({
            status: 'ok',
            data: stats,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function GetDenunciaPublic(req, res) {
    try {
        const limit = Number.isFinite(Number(req.query.limit))
            ? Number(req.query.limit)
            : undefined;
        const status = req.query.status || undefined;

        const denuncias = await denunciaService.GetDenuncia({
            status,
            limit,
        });

        const data = denuncias.map(({ usuario_id, ...rest }) => rest);

        return res.status(200).json({
            status: 'ok',
            data,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function GetDenunciaPublicStats(req, res) {
    try {
        const stats = await denunciaService.GetDenunciaStats({
            isAdmin: true,
        });

        return res.status(200).json({
            status: 'ok',
            data: stats,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

async function PatchDenunciaStatus(req, res) {
    const { id } = req.params;
    const { status, motivo_rejeicao } = req.body;

    if (!status) {
        return res.status(400).json({
            status: 'error',
            message: 'Status é obrigatório',
        });
    }

    try {
        const denunciaExistente = await denunciaService.GetDenunciaById(id);
        if (!denunciaExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Denúncia não encontrada',
            });
        }

        const denuncia = await denunciaService.UpdateDenunciaStatus(id, {
            status,
            motivo_rejeicao,
        });

        return res.status(200).json({
            status: 'ok',
            message: 'Status atualizado com sucesso',
            data: denuncia,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erro do servidor',
            error: error.message,
        });
    }
}

module.exports = {
    GetDenuncia,
    GetDenunciaById,
    GetDenunciaStats,
    GetDenunciaPublic,
    GetDenunciaPublicStats,
    PostDenuncia,
    PutDenuncia,
    PatchDenunciaStatus,
    DeleteDenuncia,
};
