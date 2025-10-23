import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Publicar.css';
import UsuarioService from '../../services/UsuarioService';
import CategoriaService from '../../services/CategoriaService';
import PostagemService from '../../services/PostagemService';
import GeneroService from '../../services/GeneroService';

function Publicar() {
    const _dbRecords = useRef(true);
    // ✅ Buscar dados atualizados do usuário
    const currentUser = UsuarioService.getCurrentUser();
    
    // Debug: verificar dados do usuário
    console.log('Dados do usuário atual:', currentUser);
    console.log('nivelAcesso:', currentUser?.nivelAcesso);
    
    // Verificar se o usuário é visitante baseado no nivelAcesso
    const isVisitor = currentUser?.nivelAcesso === 'VISITANTE' || 
                     currentUser?.nivelAcesso === null ||
                     currentUser?.nivelAcesso === undefined ||
                     currentUser?.nivelAcesso === 'NULL' ||
                     currentUser?.nivelAcesso === 'USER' || // USER também é tratado como visitante por compatibilidade
                     currentUser?.status === 'TerminarRegistro' ||
                     currentUser?.statusUsuario === 'TerminarRegistro' ||
                     currentUser?.isVisitor === true;
    
    // ✅ Se o usuário tem nivelAcesso ARTISTA, não é visitante
    const isArtist = currentUser?.nivelAcesso === 'ARTISTA';
    
    // ✅ Atualizar isVisitor se for ARTISTA
    const finalIsVisitor = isArtist ? false : isVisitor;
    
    console.log('isVisitor:', isVisitor);
    console.log('isArtist:', isArtist);
    console.log('finalIsVisitor:', finalIsVisitor);
    console.log('nivelAcesso do usuário:', currentUser?.nivelAcesso);

    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({ legenda: '', descricao: '', categoria: null, genero: null, file: null });
    const [userUpdated, setUserUpdated] = useState(false);

    // ✅ Verificar e atualizar dados do usuário ao carregar a página
    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                // Buscar dados atualizados do usuário
                const currentUser = UsuarioService.getCurrentUser();
                if (currentUser && currentUser.id) {
                    const userData = await UsuarioService.getCurrentUserFull();
                    if (userData && userData.data) {
                        console.log('Dados atualizados do usuário:', userData.data);
                        
                        // Se o usuário tem nivelAcesso ARTISTA, atualizar localStorage
                        if (userData.data.nivelAcesso === 'ARTISTA') {
                            const updatedUser = {
                                ...currentUser,
                                nivelAcesso: 'ARTISTA',
                                statusUsuario: 'ATIVO',
                                isVisitor: false
                            };
                            localStorage.setItem("user", JSON.stringify(updatedUser));
                            console.log('✅ Usuário atualizado para ARTISTA no localStorage');
                            setUserUpdated(true); // ✅ Forçar re-renderização
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao verificar status do usuário:', error);
            }
        };

        checkUserStatus();
    }, []);

    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [generos, setGeneros] = useState([]);

    useEffect(() => {
        if (_dbRecords.current) {
            CategoriaService.findAll().then(res => setCategorias(res.data)).catch(console.error);
        }
        return () => { _dbRecords.current = false; };
    }, []);

    // Carregar gêneros quando uma categoria é selecionada
    useEffect(() => {
        if (formData.categoria) {
            PostagemService.findGenerosByCategoria(formData.categoria)
                .then(res => setGeneros(res.data))
                .catch(console.error);
        } else {
            setGeneros([]); // Limpa gêneros quando nenhuma categoria está selecionada
        }
    }, [formData.categoria]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); if (e.type === 'dragleave') setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); };
    const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]); };

    const handleFileUpload = (file) => {
        setFormData(prev => ({ ...prev, file }));
        setIsUploading(true);
        setUploadProgress(0);
        const interval = setInterval(() => { setUploadProgress(prev => { if (prev >= 100) { clearInterval(interval); setIsUploading(false); return 100; } return prev + 10; }); }, 200);
        if (file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => setPreview(e.target.result); reader.readAsDataURL(file); }
        else if (file.type.startsWith('video/')) setPreview(URL.createObjectURL(file));
        else setPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.categoria) { alert('Por favor, selecione uma categoria'); return; }
        if (!formData.genero) { alert('Por favor, selecione um gênero'); return; }
        if (!formData.legenda) { alert('Por favor, adicione um título'); return; }
        if (!formData.file) { alert('Por favor, selecione um arquivo'); return; }
        setIsUploading(true);
        PostagemService.create(formData.file, formData, currentUser)
            .then(() => { setIsUploading(false); alert('🎉 Conteúdo publicado com sucesso!'); setPreview(null); setActiveStep(1); setFormData({ legenda: '', descricao: '', categoria: null, genero: null, file: null }); })
            .catch((error) => { setIsUploading(false); console.error('Erro ao publicar:', error); const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString(); alert('Erro ao publicar: ' + resMessage); });
    };

    const nextStep = () => { if (activeStep < 3) setActiveStep(activeStep + 1); };
    const prevStep = () => { if (activeStep > 1) setActiveStep(activeStep - 1); };

    // Se for visitante, mostrar tela de bloqueio
    if (finalIsVisitor) {
        return (
            <div className="home-layout">
                <Sidebar />
                <main className="main-content">
                    <div className="visitor-block-container">
                        <div className="visitor-block-content">
                            <div className="visitor-icon">🚫</div>
                            <h1>Área Restrita</h1>
                            <p>Visitantes não podem criar publicações.</p>
                            <p>Para postar conteúdo, você precisa ser um <strong>Artista</strong>.</p>
                            <div className="visitor-actions">
                                <button 
                                    className="btn-upgrade"
                                    onClick={() => window.location.href = '/perfil'}
                                >
                                    🎨 Tornar-se Artista
                                </button>
                                <button 
                                    className="btn-explore"
                                    onClick={() => window.location.href = '/home'}
                                >
                                    🏠 Explorar Conteúdo
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="home-layout">
            <Sidebar />
            <main className="main-content">
                <div className="publish-header">
                    <div className="header-content">
                        <h2 className="page-title">✨ Publicar Conteúdo</h2>
                        <p className="page-subtitle">Compartilhe sua criatividade com o mundo</p>
                    </div>
                    <SearchBar />
                </div>

                <div className="publish-steps">
                    <div className={`step ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                        <div className="step-number">1</div>
                        <span>Conteúdo</span>
                    </div>
                    <div className={`step ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Detalhes</span>
                    </div>
                    <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
                        <div className="step-number">3</div>
                        <span>Configurações</span>
                    </div>
                </div>

                <div className="publish-container">
                    <form onSubmit={handleSubmit} className="publish-form">
                        {activeStep === 1 && (
                            <div className="step-content">
                                <h3>📁 Upload do Arquivo</h3>
                                <div className={`upload-zone ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                                    {preview ? (
                                        <div className="preview-container">
                                            {formData.file?.type.startsWith('image/') && (<img src={preview} alt="Preview" className="preview-image" />)}
                                            {formData.file?.type.startsWith('video/') && (<video src={preview} controls className="preview-video" />)}
                                            {formData.file?.type.startsWith('audio/') && (<div className="audio-preview"><div className="audio-icon">🎵</div><p>{formData.file.name}</p></div>)}
                                            <button type="button" className="change-file" onClick={(e) => { e.stopPropagation(); setPreview(null); setFormData(prev => ({ ...prev, file: null })); }}>Alterar Arquivo</button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder"><div className="upload-icon">📁</div><h4>Arraste seu arquivo aqui</h4><p>ou clique para selecionar</p><div className="supported-formats"><span>Imagens</span> • <span>Vídeos</span> • <span>Áudios</span> • <span>Documentos</span></div></div>
                                    )}
                                    {isUploading && (<div className="upload-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div></div><span>{uploadProgress}%</span></div>)}
                                </div>

                                <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="image/*,video/*,audio/*,.pdf,.doc,.docx" style={{ display: 'none' }} />

                                <div className="category-selection">
                                    <h4>🎯 Selecione a Categoria</h4>
                                    <div className="categories-grid">
                                        {categorias.map(cat => (<div key={cat.id} className={`category-card ${formData.categoria === cat.id ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, categoria: cat.id }))}><div className="category-icon"><img src={`/assets/icons/${cat.icone}.png`} alt="" /></div><h5>{cat.nome}</h5><p>{cat.descricao}</p></div>))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="step-content">
                                <h3>📝 Informações do Conteúdo</h3>
                                <div className="category-selection">
                                    <h4>🎯 Selecione o Genero</h4>
                                    <div className="genres-grid">
                                        {generos.map(genero => (<div key={genero.id} className={`category-card ${formData.genero === genero.id ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, genero: genero.id }))}><h5>{genero.nome}</h5></div>))}
                                    </div>
                                </div>
                                <div className="form-row"><div className="form-group"><label htmlFor="legenda">📌 Título *</label><input type="text" id="legenda" name="legenda" value={formData.legenda} onChange={handleInputChange} placeholder="Digite um título atrativo" required /></div></div>
                                <div className="form-group"><label htmlFor="descricao">📄 Descrição</label><textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleInputChange} placeholder="Conte a história por trás da sua criação..." rows="5" /><div className="char-count">{formData.descricao.length}/500</div></div>
                            </div>
                        )}

                        <div className="form-actions">
                            {activeStep > 1 && (<button type="button" onClick={prevStep} className="btn-secondary">← Voltar</button>)}
                            {activeStep < 3 ? (<button type="button" onClick={nextStep} className="btn-primary" disabled={activeStep === 1 && (!formData.file || !formData.categoria)}>Próximo →</button>) : (<button type="submit" className="btn-publish" disabled={isUploading || !formData.legenda}>{isUploading ? '🚀 Publicando...' : '🎉 Publicar Agora'}</button>)}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Publicar;