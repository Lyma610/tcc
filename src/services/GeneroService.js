import http from "../common/http-common";
const API_URL = "genero/";

const findAll = () => {
  return http.mainInstance.get(API_URL + "findAll");
};

const findById = id => {
  return http.mainInstance.get(API_URL + `findById/${id}`);
};


const findByCategoria = id => {
  return http.mainInstance.get(API_URL + `findByCategoria/${id}`);
};

const GeneroService = {
  findAll,
  findById,
  findByCategoria,
};

export default GeneroService;