const db = require('../configs');

const STATUS_DENUNCIA = ['PENDENTE', 'APROVADO', 'REJEITADO'];

function isValidStatus(status) {
    return STATUS_DENUNCIA.includes(status);
}

async function GetDenuncia({ userId, isAdmin, status, limit, offset }) {
    const conditions = [];
    const values = [];

    if (status) {
        if (!isValidStatus(status)) {
            throw new Error(`Status de denúncia inválido: ${status}`);
        }
        values.push(status);
        conditions.push(`DENUNCIA.status = $${values.length}`);
    }

    if (userId && !isAdmin) {
        values.push(userId);
        conditions.push(`DENUNCIA.usuario_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let pagination = '';
    if (Number.isInteger(limit)) {
        values.push(limit);
        pagination += ` LIMIT $${values.length}`;
    }
    if (Number.isInteger(offset)) {
        values.push(offset);
        pagination += ` OFFSET $${values.length}`;
    }

    const sql = `SELECT DENUNCIA.iddenuncia,
                        DENUNCIA.usuario_id,
                        USUARIO.nome AS usuario_nome,
                        USUARIO.email AS usuario_email,
                        (DENUNCIA.usuario_id IS NULL) AS anonima,
                        DENUNCIA.descricao,
                        DENUNCIA.latitude,
                        DENUNCIA.longitude,
                        DENUNCIA.endereco,
                        DENUNCIA.status,
                        DENUNCIA.data_criacao,
                        DENUNCIA.data_analise,
                        DENUNCIA.motivo_rejeicao,
                        (SELECT IMAGEM_DENUNCIA.path_arquivo
                         FROM IMAGEM_DENUNCIA
                         WHERE IMAGEM_DENUNCIA.denuncia_id = DENUNCIA.iddenuncia
                         ORDER BY IMAGEM_DENUNCIA.idimagem_denuncia DESC
                         LIMIT 1) AS foto,
                        COALESCE(
                            (SELECT json_agg(IMAGEM_DENUNCIA.path_arquivo ORDER BY IMAGEM_DENUNCIA.idimagem_denuncia DESC)
                             FROM IMAGEM_DENUNCIA
                             WHERE IMAGEM_DENUNCIA.denuncia_id = DENUNCIA.iddenuncia),
                            '[]'::json
                        ) AS imagens
				 FROM DENUNCIA
                 LEFT JOIN USUARIO ON USUARIO.idusuario = DENUNCIA.usuario_id
				 ${where}
				 ORDER BY DENUNCIA.data_criacao DESC${pagination}`;

    const queryResult = await db.query(sql, values);
    return queryResult.rows;
}

async function GetDenunciaById(id) {
    const sql = `SELECT DENUNCIA.iddenuncia,
                        DENUNCIA.usuario_id,
                        USUARIO.nome AS usuario_nome,
                        USUARIO.email AS usuario_email,
                        (DENUNCIA.usuario_id IS NULL) AS anonima,
                        DENUNCIA.descricao,
                        DENUNCIA.latitude,
                        DENUNCIA.longitude,
                        DENUNCIA.endereco,
                        DENUNCIA.status,
                        DENUNCIA.data_criacao,
                        DENUNCIA.data_analise,
                        DENUNCIA.motivo_rejeicao,
                        (SELECT IMAGEM_DENUNCIA.path_arquivo
                         FROM IMAGEM_DENUNCIA
                         WHERE IMAGEM_DENUNCIA.denuncia_id = DENUNCIA.iddenuncia
                         ORDER BY IMAGEM_DENUNCIA.idimagem_denuncia DESC
                         LIMIT 1) AS foto,
                        COALESCE(
                            (SELECT json_agg(IMAGEM_DENUNCIA.path_arquivo ORDER BY IMAGEM_DENUNCIA.idimagem_denuncia DESC)
                             FROM IMAGEM_DENUNCIA
                             WHERE IMAGEM_DENUNCIA.denuncia_id = DENUNCIA.iddenuncia),
                            '[]'::json
                        ) AS imagens
				 FROM DENUNCIA
                 LEFT JOIN USUARIO ON USUARIO.idusuario = DENUNCIA.usuario_id
				 WHERE DENUNCIA.iddenuncia = $1`;

    const queryResult = await db.query(sql, [id]);
    return queryResult.rows[0];
}

async function GetDenunciaStats({ userId, isAdmin }) {
    const conditions = [];
    const values = [];

    if (userId && !isAdmin) {
        values.push(userId);
        conditions.push(`usuario_id = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `SELECT
						COUNT(*)::int AS total,
						COUNT(*) FILTER (WHERE status = 'PENDENTE')::int AS pendentes,
						COUNT(*) FILTER (WHERE status = 'APROVADO')::int AS aprovadas,
						COUNT(*) FILTER (WHERE status = 'REJEITADO')::int AS rejeitadas,
						COUNT(*) FILTER (WHERE data_criacao::date = CURRENT_DATE AND status = 'PENDENTE')::int AS pendentes_hoje,
						COUNT(*) FILTER (WHERE data_criacao >= NOW() - INTERVAL '30 days')::int AS ultimos_30_dias,
						COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (data_analise - data_criacao)) / 3600) FILTER (WHERE data_analise IS NOT NULL), 1), 0) AS tempo_medio_horas
				 FROM DENUNCIA
				 ${where}`;

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

async function PostDenuncia(params) {
    const sql = `INSERT INTO DENUNCIA (usuario_id, descricao, latitude, longitude, endereco)
				 VALUES ($1, $2, $3, $4, $5)
				 RETURNING *`;

    const { usuario_id, descricao, latitude, longitude, endereco } = params;
    const values = [usuario_id || null, descricao, latitude, longitude, endereco || null];

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

async function AddDenunciaImagens(denunciaId, imagens) {
    if (!Array.isArray(imagens) || imagens.length === 0) {
        return [];
    }

    const inserted = [];
    for (const path of imagens) {
        if (!path) continue;
        const sql = `INSERT INTO IMAGEM_DENUNCIA (denuncia_id, path_arquivo)
					 VALUES ($1, $2)
					 RETURNING *`;
        const queryResult = await db.query(sql, [denunciaId, path]);
        inserted.push(queryResult.rows[0]);
    }

    return inserted;
}

async function PutDenuncia(id, params) {
    if (params.status && !isValidStatus(params.status)) {
        throw new Error(`Status de denúncia inválido: ${params.status}`);
    }

    const sql = `UPDATE DENUNCIA
				 SET descricao = $2,
					 latitude = $3,
					 longitude = $4,
					 endereco = $5,
					 status = $6,
					 data_analise = $7,
					 motivo_rejeicao = $8
				 WHERE DENUNCIA.iddenuncia = $1
				 RETURNING *`;

    const { descricao, latitude, longitude, endereco, status, data_analise, motivo_rejeicao } =
        params;

    const values = [
        id,
        descricao,
        latitude,
        longitude,
        endereco || null,
        status,
        data_analise,
        motivo_rejeicao,
    ];

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

async function UpdateDenunciaStatus(id, params) {
    if (!isValidStatus(params.status)) {
        throw new Error(`Status de denúncia inválido: ${params.status}`);
    }

    const sql = `UPDATE DENUNCIA
				 SET status = $2,
					 data_analise = NOW(),
					 motivo_rejeicao = COALESCE($3, motivo_rejeicao)
				 WHERE DENUNCIA.iddenuncia = $1
				 RETURNING *`;

    const { status, motivo_rejeicao } = params;
    const values = [id, status, motivo_rejeicao || null];

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
    GetDenunciaStats,
    PostDenuncia,
    AddDenunciaImagens,
    PutDenuncia,
    UpdateDenunciaStatus,
    DeleteDenuncia,
    STATUS_DENUNCIA,
    isValidStatus,
};
