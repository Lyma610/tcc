import axios from "axios";

const API_URL = "https://tccbackend-completo.onrender.com/"; //remote(produção)
//const API_URL = "http://localhost:8080/"; //local(desenvolvimento)

const mainInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json"
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
  error => {
    console.error('Erro na resposta:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const multipartInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "multipart/form-data"
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