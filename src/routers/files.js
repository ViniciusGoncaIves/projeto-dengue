const controller = require('../controllers/files');

module.exports = (app, upload) => {
    app.post(
        '/upload',
        upload.single('file'),
        /* #swagger.tags = ['Arquivos'] */
        controller.uploadFile,
    );
};
