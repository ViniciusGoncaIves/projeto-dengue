const fileService = require('../services/files');
const { logError } = require('../utils/logger');

async function uploadFile(req, res) {
    try {
        const file = req.file;
        const result = await fileService.uploadFile(file);
        if (result.status === 'error') {
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        logError('uploadFile falhou', error, req);
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor', error: error.message });
    }

}

module.exports = {
    uploadFile,
};
