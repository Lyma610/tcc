import http from "../common/http-common";
const API_URL = "postagem/";

const findAll = () => {
  return http.mainInstance.get(API_URL + "findAll");
};

const findCategorias = () => {
  return http.mainInstance.get(API_URL + "findCategorias");
};

const findGeneros = () => {
  return http.mainInstance.get(API_URL + "findGeneros");
};

const findById = id => {
  return http.mainInstance.get(API_URL + `findById/${id}`);
};

const findByCategoria = id => {
  return http.mainInstance.get(API_URL + `findByCategoria/${id}`);
};

const findByGenero = id => {
  return http.mainInstance.get(API_URL + `findByGenero/${id}`);
};

const create = (file, data, usuario) => {
  const payload = {
    ...data,
    file: data.file ,
    usuario: usuario.id ,
    categoria: data.categoria
  };

  return http.multipartInstance.post(API_URL + "create", payload);
};


const alterar = (file, id, data) => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('nome', data.nome);
  formData.append('descricao', data.descricao);
  formData.append('preco', data.preco);

  if (data.categoria.id === undefined) { // SE O USUÁRIO ALTEROU A "Categoria"
    formData.append('categoria', data.categoria.toString());
  } else { // SE O USUÁRIO NÃO ALTEROU A "Categoria"
    formData.append('categoria', data.categoria.id);
  }

  /*
    for (const key of formData.entries()) {
      console.log(key[0] + ', ' + key[1]);
    } 
  */
  return http.multipartInstance.put(API_URL + `alterar/${id}`, formData);
};


const inativar = (id) => {
  return http.multipartInstance.put(API_URL + `inativar/${id}`);
};

const reativar = (id) => {
  return http.multipartInstance.put(API_URL + `reativar/${id}`);
};

const addCardapio = (id) => {
  return http.multipartInstance.put(API_URL + `addCardapio/${id}`);
};

const findByCategoriaAndGenero = (idCategoria, idGenero) => {
  return http.mainInstance.get(API_URL + `findByCategoriaAndGenero/${idCategoria}/${idGenero}`);
};

const PostagemService = {
  findAll,
  findById,
  findCategorias,
  findGeneros,
  findByCategoria,
  findByGenero,
  create,
  alterar,
  inativar,
  reativar,
  addCardapio,
  findByCategoriaAndGenero
};

export default PostagemService;