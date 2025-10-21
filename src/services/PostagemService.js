import http from "../common/http-common";
const API_URL = "postagem/";

const findAll = async () => {
  try {
    console.log('Chamando API:', API_URL + "findAll");
    const response = await http.mainInstance.get(API_URL + "findAll");
    console.log('Resposta da API findAll:', response);
    return response;
  } catch (error) {
    console.error('Erro ao buscar postagens:', error.response || error);
    throw error;
  }
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
  const formData = new FormData();
  
  // Adiciona o arquivo se existir
  if (file) {
    formData.append('file', file);
  }
  // Adiciona campos simples
  formData.append('legenda', data.legenda || '');
  formData.append('descricao', data.descricao || '');

  // Enviando objetos aninhados conforme esperado pelo @ModelAttribute no backend
  if (data.categoria !== null && data.categoria !== undefined) {
    formData.append('categoria.id', data.categoria);
  }
  if (data.genero !== null && data.genero !== undefined) {
    formData.append('genero.id', data.genero);
  }
  if (usuario && usuario.id) {
    formData.append('usuario.id', usuario.id);
  }

  return http.multipartInstance.post(API_URL + "create", formData);
};

const alterar = (file, id, data) => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('nome', data.nome);
  formData.append('descricao', data.descricao);
  formData.append('preco', data.preco);

  if (data.categoria.id === undefined) {
    formData.append('categoria', data.categoria.toString());
  } else {
    formData.append('categoria', data.categoria.id);
  }

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
  const url = idGenero === 0 
    ? API_URL + `findByCategoria/${idCategoria}`
    : API_URL + `findByCategoriaAndGenero/${idCategoria}/${idGenero}`;
  return http.mainInstance.get(url);
};

const findGenerosByCategoria = (categoriaId) => {
  return http.mainInstance.get(API_URL + `findGenerosByCategoria/${categoriaId}`);
};

// NOVO MÉTODO DELETE
const deletePost = (id) => {
  return http.mainInstance.delete(API_URL + `delete/${id}`);
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
  findByCategoriaAndGenero,
  findGenerosByCategoria,
  delete: deletePost  // Adicionado aqui
};

export default PostagemService;