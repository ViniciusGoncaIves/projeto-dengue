const db = require("../configs");

async function GetUsuario() {
    const sql = `SELECT USUARIO.idusuario,
                      USUARIO.nome,
	                  USUARIO.email,
	                  USUARIO.tipo,
	                  USUARIO.data_cadastro
               FROM USUARIO`;

    const queryResult = await db.query(sql);
    return queryResult.rows;
}

async function GetUsuarioLogin(email) {
    const sql = "SELECT idusuario, email, senha FROM usuario WHERE email = $1";

    const queryResult = await db.query(sql, [email]);
    return queryResult.rows[0];
}

async function GetUsuarioById(id) {
    const sql = `SELECT USUARIO.idusuario,
                      USUARIO.nome,
                      USUARIO.email,
                      USUARIO.tipo,
                      USUARIO.data_cadastro
               FROM USUARIO
               WHERE USUARIO.idusuario = $1`;

    const values = [id];

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

async function DeleteUsuario(id) {
    const sql = `DELETE FROM USUARIO WHERE USUARIO.idusuario = $1`;

    const values = [id];

    const queryResult = await db.query(sql, values);
    return queryResult.rows;
}

async function PostUsuario(params) {
    const sql = `INSERT INTO USUARIO (nome, email, senha, tipo)
               VALUES ($1, $2, $3, $4) RETURNING *`;

    const { nome, email, senha, tipo } = params;
    const values = [nome, email, senha, tipo];

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

async function PutUsuario(id, params) {
    const sql = `UPDATE USUARIO
                 SET nome = $2,
                     email = $3,
                     senha = COALESCE($4, senha),
                     tipo = $5
                 WHERE USUARIO.idusuario = $1
                 RETURNING idusuario, nome, email, tipo, data_cadastro`;

    const { nome, email, senha, tipo } = params;
    const values = [id, nome, email, senha || null, tipo];

    const queryResult = await db.query(sql, values);
    return queryResult.rows[0];
}

module.exports = {
    GetUsuario,
    GetUsuarioLogin,
    GetUsuarioById,
    DeleteUsuario,
    PostUsuario,
    PutUsuario,
};
