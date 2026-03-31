require("dotenv").config();

function validarEnv() {
    const keys = [
        "PORT",
        "POSTGRES_USER",
        "POSTGRES_HOST",
        "POSTGRES_DB",
        "POSTGRES_PASS",
        "POSTGRES_PORT",
        "JWT_SECRET",
    ];

    for (const key of keys) {
        if (!process.env[key]) {
            console.error(
                `Variavel de ambiente obrigatoria ('${key}') não configurada`,
            );
            process.exit(1);
        }
    }
}

module.exports = validarEnv;
