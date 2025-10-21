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

const signup = (nome, email, senha) => {
    const usuario = {
        nome,
        email,
        senha,
        nivelAcesso: 'USER'
    };
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
    console.log('Enviando dados para edição:', id);
    return http.multipartInstance.put(API_URL + `editar/${id}`, data, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000 // Aumentar o timeout para 30 segundos
    });
};

const inativar = (id) => {
    return http.multipartInstance.put(API_URL + `inativar/${id}`);
};

const reativar = (id) => {
    return http.multipartInstance.put(API_URL + `reativar/${id}`);
};

const alterarSenha = (id, data) => {
    return http.mainInstance.put(API_URL + `alterarSenha/${id}`, {
        senha: data.senha
    });
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
    inativar,
    reativar,
    alterarSenha,
    findByNome,
}

export default UsuarioService;