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
        "SALT_ROUNDS",
    ];

    for (const key of keys) {
        if (!process.env[key]) {
            console.error(
                `Variavel de ambiente obrigatoria ('${key}') não configurada`,
            );
            process.exit(1);
        }
    }

    const saltRounds = Number(process.env.SALT_ROUNDS);
    if (!Number.isInteger(saltRounds) || saltRounds <= 0) {
        console.error("Variavel SALT_ROUNDS deve ser um numero inteiro positivo");
        process.exit(1);
    }
}

module.exports = validarEnv;
