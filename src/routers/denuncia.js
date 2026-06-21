const controller = require('../controllers/denuncia');
const authMiddleware = require('../middlewares/auth');

module.exports = (app, upload) => {
    app.get('/denuncia/public', /* #swagger.tags = ['Denuncias'] */ controller.GetDenunciaPublic);
    app.get(
        '/denuncia/public-stats',
        /* #swagger.tags = ['Denuncias'] */
        controller.GetDenunciaPublicStats,
    );
    app.get(
        '/denuncia',
        authMiddleware,
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetDenuncia,
    );
    app.get(
        '/denuncia/stats',
        authMiddleware,
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetDenunciaStats,
    );
    app.get(
        '/denuncia/:id',
        authMiddleware,
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.GetDenunciaById,
    );
    app.post(
        '/denuncia',
        upload.array('imagens'),
        /* #swagger.tags = ['Denuncias'] */
        controller.PostDenuncia,
    );
    app.patch(
        '/denuncia/:id/status',
        authMiddleware,
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.PatchDenunciaStatus,
    );
    app.put(
        '/denuncia/:id',
        authMiddleware,
        upload.array('imagens'),
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.PutDenuncia,
    );
    app.delete(
        '/denuncia/:id',
        authMiddleware,
        /*
            #swagger.tags = ['Denuncias']
            #swagger.security = [{ "bearerAuth": [] }]
        */
        controller.DeleteDenuncia,
    );
};
