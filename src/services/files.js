const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
const env = require('../configs/env');
const { logError } = require('../utils/logger');

const supabase = createClient(env.bucket_url, env.bucket_key);

function normalizeFileName(fileName) {
    const parsed = path.parse(fileName || 'arquivo');
    const baseName = parsed.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    const extension = parsed.ext
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.]/g, '')
        .toLowerCase();

    return `${baseName || 'arquivo'}${extension}`;
}

function createStoragePath(file) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const uniqueId = crypto.randomUUID();
    const safeName = normalizeFileName(file.originalname);

    return `uploads/${year}/${month}/${uniqueId}-${safeName}`;
}

async function uploadFile(file) {
    if (!file) {
        return {
            status: 'error',
            message: 'Arquivo não informado',
        };
    }

    const storagePath = createStoragePath(file);
    const { data, error } = await supabase.storage
        .from('dengue_arquivos')
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
    if (error) {
        logError('Erro ao fazer upload do arquivo no Supabase', error);
        return {
            status: 'error',
            message: 'Erro ao fazer upload do arquivo',
            error: error.message,
        };
    } else {
        const { data: publicData } = supabase.storage
            .from('dengue_arquivos')
            .getPublicUrl(data.path);

        return {
            status: 'success',
            message: 'Arquivo enviado com sucesso',
            data: {
                path: data.path,
                publicUrl: publicData.publicUrl,
            },
        };
    }
}

async function getFileUrl(filePath) {
    const { data, error } = await supabase.storage.from('dengue_arquivos').getPublicUrl(filePath);
    if (error) {
        logError('Erro ao obter URL do arquivo no Supabase', error);
        return {
            status: 'error',
            message: 'Erro ao obter URL do arquivo',
            error: error.message,
        };
    } else {
        return {
            status: 'success',
            message: 'URL do arquivo obtida com sucesso',
            data: data,
        };
    }
}

module.exports = {
    uploadFile,
};
