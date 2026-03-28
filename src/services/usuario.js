const db = require('../configs');

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

module.exports = {
  GetUsuario,
  GetUsuarioById,
  DeleteUsuario,
  PostUsuario
}