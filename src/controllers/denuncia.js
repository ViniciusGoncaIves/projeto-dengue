const denunciaService = require("../services/denuncia");

async function GetDenuncia(req, res) {
	try {
		const denuncias = await denunciaService.GetDenuncia();
		return res.status(200).json({
			status: "ok",
			data: denuncias,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Erro do servidor",
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
				status: "error",
				message: "Denúncia não encontrada",
			});
		}

		return res.status(200).json({
			status: "ok",
			data: denuncia,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Erro do servidor",
			error: error.message,
		});
	}
}

async function PostDenuncia(req, res) {
	try {
		const { descricao, latitude, longitude, endereco, usuario_id } = req.body;
		const idUsuario = usuario_id || null;

		if (!descricao || latitude == null || longitude == null) {
			return res.status(400).json({
				status: "error",
				message: "Campos obrigatórios faltando",
			});
		}

		const denuncia = await denunciaService.PostDenuncia({
			usuario_id: idUsuario,
			descricao,
			latitude,
			longitude,
			endereco,
		});

		return res.status(201).json({
			status: "ok",
			message: "Denúncia cadastrada com sucesso",
			data: denuncia,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Erro do servidor",
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
				status: "error",
				message: "Denúncia não encontrada",
			});
		}

		const {
			descricao,
			latitude,
			longitude,
			endereco,
			status,
			data_analise,
			motivo_rejeicao,
		} = req.body;

		if (!descricao || latitude == null || longitude == null) {
			return res.status(400).json({
				status: "error",
				message: "Campos obrigatórios faltando",
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
			status: "ok",
			message: "Denúncia atualizada com sucesso",
			data: denuncia,
		});
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Erro do servidor",
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
				status: "error",
				message: "Denúncia não encontrada",
			});
		}

		const denuncia = await denunciaService.DeleteDenuncia(id);
		return res.status(200).json({
			status: "ok",
			message: "Denúncia deletada com sucesso",
			data: denuncia,
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
	GetDenuncia,
	GetDenunciaById,
	PostDenuncia,
	PutDenuncia,
	DeleteDenuncia,
}