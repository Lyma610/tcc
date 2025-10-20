import http from "../common/http-common";
const API_URL = "categoria/";

const findAll = () => {
  return http.mainInstance.get(API_URL + "findAll");
};

const findById = id => {
  return http.mainInstance.get(API_URL + `findById/${id}`);
};


const CategoriaService = {
  findAll,
  findById,
};

export default CategoriaService;