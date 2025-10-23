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
    if (data.senha) {
        formData.append('senha', data.senha);
        console.log('Adicionado senha:', '***');
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
        throw error;
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

// Método para salvar dados completos no banco usando endpoint /editar
const salvarDadosCompletos = async (id, data) => {
    console.log('=== SALVANDO DADOS COMPLETOS NO BANCO ===');
    console.log('ID do usuário:', id);
    console.log('Dados recebidos:', data);
    
    try {
        // Usar endpoint /editar original com FormData
        const formData = new FormData();
        
        // Adicionar todos os campos como strings
        if (data.nome) formData.append('nome', data.nome);
        if (data.email) formData.append('email', data.email);
        if (data.bio) formData.append('bio', data.bio);
        // ✅ Sempre adicionar nivelAcesso, forçando ARTISTA se necessário
        let nivelAcessoFinal = data.nivelAcesso || 'ARTISTA';
        
        // ✅ Se estiver completando registro, forçar ARTISTA
        if (data.statusUsuario === 'ATIVO' || data.status === 'ATIVO') {
            nivelAcessoFinal = 'ARTISTA';
            console.log('🎯 Completando registro - forçando nivelAcesso para ARTISTA');
        }
        
        formData.append('nivelAcesso', nivelAcessoFinal);
        console.log('🔧 nivelAcesso final que será enviado:', nivelAcessoFinal);
        if (data.statusUsuario) formData.append('statusUsuario', data.statusUsuario);
        if (data.senha) formData.append('senha', data.senha); // ✅ Adicionar senha
        
        // Log detalhado do FormData
        console.log('=== FORM DATA PREPARADO ===');
        console.log('Dados recebidos:', data);
        console.log('nivelAcesso recebido:', data.nivelAcesso);
        console.log('nivelAcesso que será enviado:', data.nivelAcesso || 'ARTISTA');
        console.log('FormData preparado:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        const response = await http.multipartInstance.put(API_URL + `editar/${id}`, formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('Resposta da edição:', response);
        
        // ✅ Verificar se o nivelAcesso foi atualizado corretamente
        if (response && response.data) {
            console.log('✅ Dados retornados pelo backend:', response.data);
            console.log('✅ nivelAcesso no retorno:', response.data.nivelAcesso);
            
            // ✅ Se nivelAcesso não foi atualizado, forçar ARTISTA
            if (!response.data.nivelAcesso || response.data.nivelAcesso !== 'ARTISTA') {
                console.log('⚠️ nivelAcesso não foi atualizado corretamente, forçando...');
                try {
                    await forcarNivelAcessoArtista(id);
                    console.log('✅ nivelAcesso forçado para ARTISTA com sucesso');
                } catch (forceError) {
                    console.error('❌ Erro ao forçar nivelAcesso:', forceError);
                }
            }
        }
        
        if (response && response.data) {
            // Atualizar localStorage com dados atualizados
            const currentUser = JSON.parse(localStorage.getItem("user"));
            const updatedUser = {
                ...currentUser,
                nome: data.nome,
                email: data.email,
                bio: data.bio,
                nivelAcesso: nivelAcessoFinal, // ✅ Usar o nivelAcesso que foi enviado
                statusUsuario: data.statusUsuario,
                isVisitor: false,
                // ✅ Garantir que não seja mais visitante
                status: 'ATIVO', // Remover status de TerminarRegistro
                statusUsuario: 'ATIVO' // Forçar status ATIVO
            };
            
            console.log('🔄 Usuário atualizado no localStorage:', updatedUser);
            console.log('🔄 nivelAcesso no localStorage:', updatedUser.nivelAcesso);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            return {
                data: updatedUser,
                status: 200
            };
        } else {
            throw new Error('Falha na edição');
        }
    } catch (error) {
        console.error('Erro ao salvar dados completos:', error);
        throw error;
    }
};

const findByNome = nome => {
    return http.mainInstance.get(API_URL + `findByNome?nome=${nome}`);
};

// ✅ Método específico para forçar nivelAcesso ARTISTA
const forcarNivelAcessoArtista = async (id) => {
    try {
        console.log('🎯 Forçando nivelAcesso para ARTISTA no usuário:', id);
        
        const formData = new FormData();
        formData.append('nivelAcesso', 'ARTISTA');
        formData.append('statusUsuario', 'ATIVO');
        
        const response = await http.multipartInstance.put(API_URL + `editar/${id}`, formData, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 30000,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('✅ nivelAcesso forçado para ARTISTA:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Erro ao forçar nivelAcesso:', error);
        throw error;
    }
};

// ✅ Método para garantir que o usuário seja ARTISTA
const garantirNivelAcessoArtista = async (id) => {
    try {
        console.log('🔍 Verificando nivelAcesso do usuário:', id);
        
        // Primeiro, buscar dados atuais do usuário
        const userResponse = await findById(id);
        const currentNivelAcesso = userResponse?.data?.nivelAcesso;
        
        console.log('📊 nivelAcesso atual no banco:', currentNivelAcesso);
        
        // Se não for ARTISTA, forçar atualização
        if (currentNivelAcesso !== 'ARTISTA') {
            console.log('🔄 nivelAcesso não é ARTISTA, forçando atualização...');
            await forcarNivelAcessoArtista(id);
            
            // Verificar novamente
            const verifyResponse = await findById(id);
            const newNivelAcesso = verifyResponse?.data?.nivelAcesso;
            console.log('✅ nivelAcesso após forçar:', newNivelAcesso);
            
            return newNivelAcesso === 'ARTISTA';
        } else {
            console.log('✅ nivelAcesso já é ARTISTA');
            return true;
        }
    } catch (error) {
        console.error('❌ Erro ao garantir nivelAcesso ARTISTA:', error);
        throw error;
    }
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
    salvarDadosCompletos,
    findByNome,
    forcarNivelAcessoArtista,
    garantirNivelAcessoArtista,
}

export default UsuarioService;