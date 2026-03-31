const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET = process.env.JWT_SECRET;

/**
 * Cria um token com o ID do usuario
 * @param {number} userId - ID do usuario
 * @returns {string} - Token de autenticação
 */
function generateToken(userId) {
    const token = jwt.sign({ userId }, SECRET, { expiresIn: "1d" });

    return token;
}

/**
 * Verifica se o token é válido
 * @param {string} token - O token de autenticação
 * @returns {number} - ID do usuário autenticado
 */
function verifyToken(token) {
    const { userId } = jwt.verify(token, SECRET);
    return userId;
}

/**
 * Encripta a senha
 * @param {string} password - A senha para encriptar
 */
function hashPassword(password) {
    return bcrypt.hash(password, process.env.SALT_ROUNDS);
}

/**
 * Compara a senha informada com a senha encriptada do banco
 * @param {string} password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} - True se for a senha correta false senão.
 */
function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    verifyPassword,
};
