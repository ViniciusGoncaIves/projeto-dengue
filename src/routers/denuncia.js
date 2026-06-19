const controller = require('../controllers/denuncia');
const authMiddleware = require('../middlewares/auth');

module.exports = (app, upload) => {
    app.get('/denuncia/public', controller.GetDenunciaPublic);
    app.get('/denuncia/public-stats', controller.GetDenunciaPublicStats);
    app.get('/denuncia', authMiddleware, controller.GetDenuncia);
    app.get('/denuncia/stats', authMiddleware, controller.GetDenunciaStats);
    app.get('/denuncia/:id', authMiddleware, controller.GetDenunciaById);
    app.post('/denuncia', upload.array('imagens'), controller.PostDenuncia);
    app.patch('/denuncia/:id/status', authMiddleware, controller.PatchDenunciaStatus);
    app.put('/denuncia/:id', authMiddleware, controller.PutDenuncia);
    app.delete('/denuncia/:id', authMiddleware, controller.DeleteDenuncia);
};
