const db = require("../configs");

async function GetDenuncia() {
	const sql = `SELECT DENUNCIA.iddenuncia,
						DENUNCIA.usuario_id,
						DENUNCIA.descricao,
						DENUNCIA.latitude,
						DENUNCIA.longitude,
						DENUNCIA.endereco,
						DENUNCIA.status,
						DENUNCIA.data_criacao,
						DENUNCIA.data_analise,
						DENUNCIA.motivo_rejeicao
				 FROM DENUNCIA`;

	const queryResult = await db.query(sql);
	return queryResult.rows;
}

async function GetDenunciaById(id) {
	const sql = `SELECT DENUNCIA.iddenuncia,
						DENUNCIA.usuario_id,
						DENUNCIA.descricao,
						DENUNCIA.latitude,
						DENUNCIA.longitude,
						DENUNCIA.endereco,
						DENUNCIA.status,
						DENUNCIA.data_criacao,
						DENUNCIA.data_analise,
						DENUNCIA.motivo_rejeicao
				 FROM DENUNCIA
				 WHERE DENUNCIA.iddenuncia = $1`;

	const queryResult = await db.query(sql, [id]);
	return queryResult.rows[0];
}

async function PostDenuncia(params) {
	const sql = `INSERT INTO DENUNCIA (usuario_id, descricao, latitude, longitude, endereco)
				 VALUES ($1, $2, $3, $4, $5)
				 RETURNING *`;

	const { usuario_id, descricao, latitude, longitude, endereco } = params;
	const values = [usuario_id, descricao, latitude, longitude, endereco || null];

	const queryResult = await db.query(sql, values);
	return queryResult.rows[0];
}

async function PutDenuncia(id, params) {
	const sql = `UPDATE DENUNCIA
				 SET descricao = $2,
					 latitude = $3,
					 longitude = $4,
					 endereco = $5,
					 status = COALESCE($6, status),
					 data_analise = COALESCE($7, data_analise),
					 motivo_rejeicao = COALESCE($8, motivo_rejeicao)
				 WHERE DENUNCIA.iddenuncia = $1
				 RETURNING *`;

	const {
		descricao,
		latitude,
		longitude,
		endereco,
		status,
		data_analise,
		motivo_rejeicao,
	} = params;

	const values = [
		id,
		descricao,
		latitude,
		longitude,
		endereco || null,
		status || null,
		data_analise || null,
		motivo_rejeicao || null,
	];

	const queryResult = await db.query(sql, values);
	return queryResult.rows[0];
}

async function DeleteDenuncia(id) {
	const sql = `DELETE FROM DENUNCIA
				 WHERE DENUNCIA.iddenuncia = $1
				 RETURNING *`;

	const queryResult = await db.query(sql, [id]);
	return queryResult.rows[0];
}


module.exports = {
	GetDenuncia,
	GetDenunciaById,
	PostDenuncia,
	PutDenuncia,
	DeleteDenuncia,
}