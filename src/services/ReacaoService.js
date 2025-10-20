import http from '../common/http-common';
const API_URL = "reacao/";

const findAll = () => {
  return http.mainInstance.get(API_URL + 'findAll');
};

const findById = id => {
  return http.mainInstance.get(API_URL + `findById/${id}`);
};

const create = data => {
  return http.mainInstance.post(API_URL + 'create', data);
};

const inativar = id => {
  return http.mainInstance.put(API_URL + `inativar/${id}`);
};

const ReacaoService = {
  findAll,
  findById,
  create,
  inativar,
};

export default ReacaoService;
