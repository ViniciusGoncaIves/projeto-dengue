require('./validarEnv.js')();
const express = require('express');
const app = express();
const multer = require('multer');
const db = require('./configs');
const PORT = process.env.PORT;
const { Router } = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger-output.json');
const { logError, logWarning, requestContext } = require('./utils/logger');

process.on('uncaughtException', (error) => {
    logError('uncaughtException', error);
});

process.on('unhandledRejection', (reason) => {
    logError('unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)));
});

app.use(cors({}));
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            logWarning('Resposta HTTP com erro', {
                statusCode: res.statusCode,
                request: requestContext(req),
            });
        }
    });
    next();
});

const upload = multer({ storage: multer.memoryStorage() });
const router = new Router();
require('./routers')(router, upload);
app.use('/api', router);
app.get('/api/docs.json', (req, res) => res.json(swaggerDocument));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', async (req, res) => {
    try {
        const sql = 'select version()';
        const result = await db.query(sql).then((response) => response.rows);
        return res.status(200).json({
            status: 'ok',
            message: 'Conexão com o banco de dados realizada com sucesso',
            data: result,
        });
    } catch (error) {
        logError('GET / falhou', error, req);
        return res.status(500).json({
            status: 'error',
            message: 'Erro ao conectar ao banco de dados',
            error: error.message,
        });
    }
});

app.use((error, req, res, next) => {
    logError('Erro nao tratado pelo Express', error, req);
    if (res.headersSent) {
        return next(error);
    }
    return res.status(500).json({
        status: 'error',
        message: 'Erro do servidor',
        error: error.message,
    });
});

app.listen(PORT, () => {
    console.log(`API Rodando na porta ${PORT}`);
});
