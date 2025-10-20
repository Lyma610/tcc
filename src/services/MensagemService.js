import http from '../common/http-common';
const API_URL = "mensagem/";

const findAll = () => {
  return http.mainInstance.get(API_URL + 'findAll');
};

const findById = id => {
  return http.mainInstance.get(API_URL + `findById/${id}`);
};

const findByEmail = email => {
  return http.mainInstance.get(API_URL + `findByEmail/${encodeURIComponent(email)}`);
};

const findAllAtivos = () => {
  return http.mainInstance.get(API_URL + 'findAllAtivos');
};

const save = data => {
  return http.mainInstance.post(API_URL + 'save', data);
};

const inativar = id => {
  return http.mainInstance.put(API_URL + `inativar/${id}`);
};

const MensagemService = {
  findAll,
  findById,
  findByEmail,
  findAllAtivos,
  save,
  inativar,
};

export default MensagemService;
