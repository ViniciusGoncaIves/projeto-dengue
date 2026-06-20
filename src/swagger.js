const path = require('path');
const swaggerAutogen = require('swagger-autogen')({
    openapi: '3.0.0',
    autoHeaders: true,
    autoQuery: true,
    autoBody: true,
});

const outputFile = path.join(__dirname, 'docs', 'swagger-output.json');
const endpointsFiles = [
    path.join(__dirname, 'routers', 'auth.js'),
    path.join(__dirname, 'routers', 'usuario.js'),
    path.join(__dirname, 'routers', 'denuncia.js'),
    path.join(__dirname, 'routers', 'files.js'),
];

const doc = {
    info: {
        title: 'Projeto Dengue API',
        description: 'Documentacao OpenAPI gerada automaticamente a partir das rotas do backend.',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'http://localhost:{port}/api',
            description: 'Servidor local',
            variables: {
                port: {
                    default: process.env.PORT || '3000',
                },
            },
        },
    ],
    tags: [
        { name: 'Auth', description: 'Autenticacao e usuario autenticado' },
        { name: 'Usuarios', description: 'Gerenciamento de usuarios' },
        { name: 'Denuncias', description: 'Gerenciamento e consulta de denuncias' },
        { name: 'Arquivos', description: 'Upload de arquivos' },
    ],
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    },
    definitions: {
        ApiResponse: {
            status: 'ok',
            message: 'Operacao realizada com sucesso',
        },
        Usuario: {
            idusuario: 1,
            nome: 'Maria Silva',
            email: 'maria@email.com',
            tipo: 'USER',
            data_cadastro: '2026-01-01T00:00:00.000Z',
        },
        Denuncia: {
            iddenuncia: 1,
            usuario_id: 1,
            descricao: 'Foco de agua parada',
            latitude: -23.55052,
            longitude: -46.633308,
            endereco: 'Rua Exemplo, 100',
            status: 'PENDENTE',
            data_criacao: '2026-01-01T00:00:00.000Z',
            data_analise: null,
            motivo_rejeicao: null,
            foto: 'https://example.com/uploads/foto.jpg',
        },
    },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
