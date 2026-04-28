require("./validarEnv.js")();
const express = require("express");
const app = express();
const db = require("./configs");
const PORT = process.env.PORT;
const { Router } = require("express");

app.use(express.json({ limit: "50mb" }));

const router = new Router();
require("./routers")(router);
app.use("/api", router);

app.get("/", async (req, res) => {
    try {
        const sql = "select version()";
        const result = await db.query(sql).then((response) => response.rows);
        return res.status(200).json({
            status: "ok",
            message: "Conexão com o banco de dados realizada com sucesso",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Erro ao conectar ao banco de dados",
            error: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`API Rodando na porta ${PORT}`);
});
