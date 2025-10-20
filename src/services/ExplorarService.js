import http from "../common/http-common";
const API_URL = "postagem/";
const USUARIO_API_URL = "usuario/";

const findAllPostagens = async () => {
  try {
    const response = await http.mainInstance.get(API_URL + "findAll");
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar postagens:', error);
    return [];
  }
};

const formatarNumeroSeguidores = (numero) => {
  if (numero >= 1000000) {
    return (numero / 1000000).toFixed(1) + 'M';
  } else if (numero >= 1000) {
    return (numero / 1000).toFixed(1) + 'k';
  }
  return numero.toString();
};

const getSugestoesUsuarios = async () => {
  try {
    // Busca a lista inicial de usuários
    const response = await http.mainInstance.get(USUARIO_API_URL + "findAll");
    
    // Seleciona 4 usuários aleatoriamente
    const usuariosSelecionados = response.data
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    // Busca os dados completos para cada usuário selecionado
    const usuariosDetalhados = await Promise.all(
      usuariosSelecionados.map(async (usuario) => {
        const dadosCompletos = await getUsuario(usuario.id);
        return {
          ...dadosCompletos,
          fotoUrl: dadosCompletos.foto ? `data:image/jpeg;base64,${dadosCompletos.foto}` : null,
          seguidores: formatarNumeroSeguidores(dadosCompletos.seguidores || 0),
          categoriaPrincipal: dadosCompletos.categoriaPrincipal || { nome: 'Artista' }
        };
      })
    );
    
    return usuariosDetalhados;
  } catch (error) {
    console.error('Erro ao buscar sugestões de usuários:', error);
    return [];
  }
};

const findByCategoria = async (categoriaId) => {
  try {
    const response = await http.mainInstance.get(API_URL + `findByCategoria/${categoriaId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar postagens por categoria:', error);
    throw error;
  }
};

const findByGenero = async (generoId) => {
  try {
    const response = await http.mainInstance.get(API_URL + `findByGenero/${generoId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar postagens por gênero:', error);
    throw error;
  }
};

const getImageUrl = (postagemId) => {
  return `${http.mainInstance.defaults.baseURL}${API_URL}image/${postagemId}`;
};

const getUserPhotoUrl = (fotoBase64) => {
  if (!fotoBase64) return null;
  return `data:image/jpeg;base64,${fotoBase64}`;
};

const getUsuario = async (userId) => {
  try {
    const response = await http.mainInstance.get(`${USUARIO_API_URL}findById/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return null;
  }
};

const getAllUsuarios = async () => {
  try {
    const response = await http.mainInstance.get(`${USUARIO_API_URL}findAll`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    return [];
  }
};

const getUsuariosAtivos = async () => {
  try {
    const response = await http.mainInstance.get(`${USUARIO_API_URL}findAllAtivos`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    return [];
  }
};

const createUsuario = async (usuario) => {
  try {
    const response = await http.mainInstance.post(`${USUARIO_API_URL}create`, usuario);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

const saveUsuario = async (usuario) => {
  try {
    const response = await http.mainInstance.post(`${USUARIO_API_URL}save`, usuario);
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    throw error;
  }
};

const editarUsuario = async (id, formData) => {
  try {
    const response = await http.mainInstance.put(`${USUARIO_API_URL}editar/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    throw error;
  }
};

const alterarSenha = async (id, senhaData) => {
  try {
    const response = await http.mainInstance.put(`${USUARIO_API_URL}alterarSenha/${id}`, senhaData);
    return response.data;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    throw error;
  }
};

const inativarUsuario = async (id) => {
  try {
    const response = await http.mainInstance.put(`${USUARIO_API_URL}inativar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao inativar usuário:', error);
    throw error;
  }
};

const loginUsuario = async (credentials) => {
  try {
    const response = await http.mainInstance.post(`${USUARIO_API_URL}login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

const ExplorarService = {
  findAllPostagens,
  findByCategoria,
  findByGenero,
  getImageUrl,
  getUserPhotoUrl,
  getUsuario,
  getSugestoesUsuarios,
  getAllUsuarios,
  getUsuariosAtivos,
  createUsuario,
  saveUsuario,
  editarUsuario,
  alterarSenha,
  inativarUsuario,
  loginUsuario
};

export default ExplorarService;