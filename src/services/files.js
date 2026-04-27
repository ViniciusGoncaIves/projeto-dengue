const {createClient} =  require('@supabase/supabase-js') 
const env = require('../configs/env');

const supabase = createClient(env.bucket_url, env.bucket_key)

async function uploadFile(file) {
  console.log('Arquivo recebido para upload:', file);

  const { data, error } = await supabase.storage.from('dengue_arquivos').upload('/uploads/' + file.originalname, file.buffer)
  if (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    return {
      status: 'error',
      message: 'Erro ao fazer upload do arquivo',
      error: error.message,
    }
  } else {
    return {
      status: 'success',
      message: 'Arquivo enviado com sucesso',
      data: data,
    }
  }
}

async function getFileUrl(filePath) {
  const { data, error } = await supabase.storage.from('dengue_arquivos').getPublicUrl(filePath)
  if (error) {
    console.error('Erro ao obter URL do arquivo:', error);
    return {
      status: 'error',
      message: 'Erro ao obter URL do arquivo',
      error: error.message,
    }
  } else {
    return {
      status: 'success',
      message: 'URL do arquivo obtida com sucesso',
      data: data,
    }
  }
}

module.exports = {
  uploadFile,
};