import http from '../common/http-common';
const API_URL = "usuario/";

const findAll = () => {
    return http.mainInstance.get(API_URL + 'findAll');
};

const findById = (id) => {
    return http.mainInstance.get(API_URL + `findById/${id}`);
};

const normalizeUser = (user) => {
    if (!user) return user;
    try {
        // Se já tiver foto como dataURL
        if (user.foto && typeof user.foto === 'string' && user.foto.startsWith('data:image')) {
            user.fotoPerfil = user.foto;
            return user;
        }

        // Caso foto venha como objeto { data: [...] } ou array de bytes
        const fotoArray = user.foto && (user.foto.data || user.foto);
        if (fotoArray && fotoArray.length) {
            const bytes = new Uint8Array(fotoArray);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64String = btoa(binary);
            user.fotoPerfil = `data:image/jpeg;base64,${base64String}`;
            try {
                // também criar um object URL (mais eficiente para renderização)
                const blob = new Blob([bytes], { type: 'image/jpeg' });
                if (typeof URL !== 'undefined' && URL.createObjectURL) {
                    user.fotoPerfilBlob = URL.createObjectURL(blob);
                }
            } catch (e) {
                // não crítico, apenas log
                console.warn('Não foi possível criar blob URL da foto', e);
            }
        } else if (user.foto && typeof user.foto === 'string') {
            // pode ser que backend retorne apenas a string base64 sem prefixo
            const possibleBase64 = user.foto;
            const isBase64 = /^[A-Za-z0-9+/=\r\n]+$/.test(possibleBase64.replace(/\s+/g, ''));
            if (isBase64) {
                const dataUrl = `data:image/jpeg;base64,${possibleBase64.replace(/\s+/g, '')}`;
                user.fotoPerfil = dataUrl;
                try {
                    // criar blob url a partir do dataURL
                    const byteString = atob(possibleBase64.replace(/\s+/g, ''));
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
                    const blob = new Blob([ia], { type: 'image/jpeg' });
                    if (typeof URL !== 'undefined' && URL.createObjectURL) {
                        user.fotoPerfilBlob = URL.createObjectURL(blob);
                    }
                } catch (e) {
                    console.warn('Não foi possível criar blob url a partir do base64', e);
                }
            }
        }
    } catch (err) {
        console.error('Erro ao normalizar usuário:', err, user);
    }
    return user;
};

const getCurrentUserFull = async () => {
    const current = getCurrentUser();
    if (!current || !current.id) return null;
    const resp = await findById(current.id);
    const user = resp.data || resp;
    const normalized = normalizeUser(user);
    try {
        localStorage.setItem('user', JSON.stringify(normalized));
    } catch (err) {
        console.warn('Não foi possível gravar usuário normalizado no localStorage', err);
    }
    return normalized;
};

const signup = (nome, email, senha, tipoUsuario = 'VISITANTE') => {
    const usuario = {
        nome,
        email,
        senha,
        nivelAcesso: tipoUsuario
    };
    
    console.log('=== DADOS DE CADASTRO ===');
    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Tipo de usuário:', tipoUsuario);
    console.log('Objeto enviado:', usuario);
    console.log('========================');
    
    // Usar endpoint específico para visitantes
    if (tipoUsuario === 'VISITANTE') {
        return http.mainInstance.post(API_URL + "create-visitor", usuario);
    }
    
    // Endpoint normal para artistas
    return http.mainInstance.post(API_URL + "save", usuario);
};

const signin = async (email, senha) => {
    const response = await http.mainInstance
        .post(API_URL + "login", {
            email,
            senha,
        });
    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const create = data => {
    const formData = new FormData();
    formData.append('nome', data.nome);
    formData.append('email', data.email);
    formData.append('nivelAcesso', data.nivelAcesso);

    return http.mainInstance.post(API_URL + "create", formData);
};

const editar = async (id, data) => {
    console.log('=== EDITANDO USUÁRIO ===');
    console.log('ID do usuário:', id);
    console.log('Dados recebidos:', data);
    
    // Verificar se a API está respondendo
    try {
        console.log('Verificando saúde da API...');
        await http.mainInstance.get('usuario/findAll');
        console.log('API está respondendo');
    } catch (healthError) {
        console.warn('API pode estar com problemas:', healthError.message);
    }
    
    // Tentar primeiro com FormData (como o backend espera)
    const formData = new FormData();
    
    // Adicionar todos os campos como strings
    if (data.nome) {
        formData.append('nome', data.nome);
        console.log('Adicionado nome:', data.nome);
    }
    if (data.email) {
        formData.append('email', data.email);
        console.log('Adicionado email:', data.email);
    }
    if (data.bio) {
        formData.append('bio', data.bio);
        console.log('Adicionado bio:', data.bio);
    }
    if (data.nivelAcesso) {
        formData.append('nivelAcesso', data.nivelAcesso);
        console.log('Adicionado nivelAcesso:', data.nivelAcesso);
    }
    if (data.statusUsuario) {
        formData.append('statusUsuario', data.statusUsuario);
        console.log('Adicionado statusUsuario:', data.statusUsuario);
    }
    
    // Se há arquivo, adicionar
    if (data.foto && data.foto instanceof File) {
        formData.append('file', data.foto);
        console.log('Adicionado arquivo:', data.foto.name);
    }
    
    // Log do FormData
    console.log('FormData preparado:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    
    console.log('URL da requisição:', API_URL + `editar/${id}`);
    
    try {
        const response = await http.multipartInstance.put(API_URL + `editar/${id}`, formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000, // 30 segundos para Render
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });
        
        console.log('Resposta do servidor:', response);
        return response;
    } catch (error) {
        console.error('Erro na requisição FormData:', error);
        console.error('Status do erro:', error.response?.status);
        console.error('Dados do erro:', error.response?.data);
        console.error('Headers do erro:', error.response?.headers);
        
        // Se FormData falhar, tentar com JSON (fallback)
        console.log('Tentando fallback com JSON...');
        try {
            const jsonResponse = await http.mainInstance.put(API_URL + `editar/${id}`, data, {
                timeout: 20000, // 20 segundos para Render
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log('Resposta JSON do servidor:', jsonResponse);
            return jsonResponse;
        } catch (jsonError) {
            console.error('Erro também com JSON:', jsonError);
            throw error; // Lançar o erro original do FormData
        }
    }
};


// Método para atualizar tipo de usuário de usuários existentes
const atualizarTipoUsuario = (id, tipoUsuario) => {
    const usuario = {
        id: id,
        tipoUsuario: tipoUsuario,
        tipo: tipoUsuario,
        userType: tipoUsuario,
        perfil: tipoUsuario
    };
    
    console.log('Atualizando tipo de usuário:', usuario);
    
    return http.mainInstance.put(API_URL + `editar/${id}`, usuario);
};

const inativar = (id) => {
    return http.multipartInstance.put(API_URL + `inativar/${id}`);
};

const reativar = (id) => {
    return http.multipartInstance.put(API_URL + `reativar/${id}`);
};

const alterarSenha = (id, data) => {
    console.log('Alterando senha para usuário:', id);
    console.log('Dados da senha:', data);
    
    return http.mainInstance.put(API_URL + `alterarSenha/${id}`, {
        senha: data.senha
    });
};

// Método para salvar dados completos no banco usando endpoint /create
const salvarDadosCompletos = async (id, data) => {
    console.log('=== SALVANDO DADOS COMPLETOS NO BANCO ===');
    console.log('ID do usuário:', id);
    console.log('Dados recebidos:', data);
    
    try {
        // Buscar dados atuais do usuário
        console.log('Buscando dados atuais do usuário...');
        const currentUserResponse = await findById(id);
        console.log('Usuário atual encontrado:', currentUserResponse.data);
        
        if (currentUserResponse.data) {
            const currentUser = currentUserResponse.data;
            
            // Criar novo usuário com dados atualizados usando endpoint /create
            const novoUsuario = {
                nome: data.nome,
                email: data.email,
                senha: data.senha, // Senha será criptografada no backend
                bio: data.bio,
                nivelAcesso: data.nivelAcesso,
                statusUsuario: 'ATIVO' // Ativar conta
            };
            
            console.log('Criando novo usuário com dados atualizados:', novoUsuario);
            
            // Usar endpoint /create que sabemos que funciona
            const createResponse = await http.mainInstance.post(API_URL + "create", novoUsuario);
            console.log('Resposta da criação:', createResponse);
            
            if (createResponse && createResponse.data) {
                // Atualizar localStorage com dados do novo usuário
                const updatedUser = {
                    ...currentUser,
                    ...novoUsuario,
                    id: currentUser.id, // Manter o ID original
                    isVisitor: false
                };
                
                console.log('Usuário atualizado no localStorage:', updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                
                return {
                    data: updatedUser,
                    status: 200
                };
            } else {
                throw new Error('Falha ao criar usuário atualizado');
            }
        } else {
            throw new Error('Usuário não encontrado');
        }
    } catch (error) {
        console.error('Erro ao salvar dados completos:', error);
        throw error;
    }
};

const findByNome = nome => {
    return http.mainInstance.get(API_URL + `findByNome?nome=${nome}`);
};


const UsuarioService = {
    findAll,
    findById,
    signup,
    signin,
    logout,
    getCurrentUser,
    getCurrentUserFull,
    create,
    editar,
    atualizarTipoUsuario,
    inativar,
    reativar,
    alterarSenha,
    atualizarDadosBasicos,
    salvarDadosCompletos,
    findByNome,
}

export default UsuarioService;