const controller = require('../controllers/files');

module.exports = (app, upload) => {
    app.post('/upload', upload.single('file'), controller.uploadFile);
};