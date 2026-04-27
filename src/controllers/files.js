const fileService = require('../services/files');

async function uploadFile(req, res) {
    try {
        const file = req.file;
        const result = await fileService.uploadFile(file);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro interno do servidor', error: error.message });
    }

}

module.exports = {
    uploadFile,
};