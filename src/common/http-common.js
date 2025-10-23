import axios from "axios";

const API_URL = "https://tccbackend-completo.onrender.com/"; //remote(produção)
//const API_URL = "http://localhost:8080/"; //local(desenvolvimento)

const mainInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json"
  },
  timeout: 30000, // 30 segundos para APIs na nuvem
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceitar códigos 2xx e 4xx
  }
});

// Adiciona interceptors para logging
mainInstance.interceptors.request.use(
  config => {
    console.log('Requisição:', config.method.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  error => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

mainInstance.interceptors.response.use(
  response => {
    console.log('Resposta:', response.status, response.data);
    return response;
  },
  async error => {
    console.error('Erro na resposta:', error.response?.status, error.response?.data || error.message);
    
    // Retry automático para erros de rede ou 5xx
    if (error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' || 
        (error.response?.status >= 500 && error.response?.status < 600)) {
      
      console.log('Tentando retry automático...');
      
      // Aguardar um pouco antes do retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const retryResponse = await mainInstance.request(error.config);
        console.log('Retry bem-sucedido:', retryResponse.status);
        return retryResponse;
      } catch (retryError) {
        console.error('Retry falhou:', retryError);
      }
    }
    
    return Promise.reject(error);
  }
);

const multipartInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "multipart/form-data"
  },
  timeout: 45000, // 45 segundos para uploads
  maxRedirects: 5,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceitar códigos 2xx e 4xx
  }
});

const apiCep = axios.create( {
  baseURL: `https://viacep.com.br/ws/`,
  headers: {
    "Content-type": "application/json"
  }
});


const httpCommom = {
  mainInstance,
  multipartInstance,
  apiCep,
};

export default httpCommom;