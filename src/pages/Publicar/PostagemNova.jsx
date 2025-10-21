import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Publicar.css';
import UsuarioService from '../../services/UsuarioService';
import CategoriaService from '../../services/CategoriaService';
import PostagemService from '../../services/PostagemService';
import GeneroService from '../../services/GeneroService';

function PostagemNova() {
    const _dbRecords = useRef(true);
    const usuario = UsuarioService.getCurrentUser();

    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({
        legenda: '',
        descricao: '',
        categoria: null,
        genero: null,
        file: null
    });

    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [categorias, setCategorias] = useState([]);
    const [generos, setGeneros] = useState([]);

    const getCategorias = () => {
        CategoriaService.findAll().then(
            (response) => {
                const categorias = response.data;
                setCategorias(categorias);
            }
        ).catch((error) => {
            console.log(error);
        })
    }

    const getGeneros = async (categoriaId = null) => {
        try {
            console.log('Buscando gêneros para categoria:', categoriaId);
            
            if (categoriaId === 6) {
                // Se for categoria 6, buscar gêneros das categorias 4 e 5
                const [response4, response5] = await Promise.all([
                    PostagemService.findGenerosByCategoria(4),
                    PostagemService.findGenerosByCategoria(5)
                ]);
                
                // Combinar os gêneros das duas categorias
                const generosComibinados = [
                    ...(response4.data || []),
                    ...(response5.data || [])
                ];
                
                console.log('Gêneros combinados (cat 4 e 5):', generosComibinados);
                setGeneros(generosComibinados);
                return;
            }
            
            if (categoriaId) {
                // Para outras categorias, buscar normalmente
                const response = await PostagemService.findGenerosByCategoria(categoriaId);
                console.log('Gêneros recebidos para categoria', categoriaId, ':', response.data);
                setGeneros(response.data || []);
            } else {
                // Sem categoria: limpar gêneros
                setGeneros([]);
            }
        } catch (error) {
            console.error('Erro ao buscar gêneros:', error);
            setGeneros([]);
        }
    }

    // useEffect para carregar categorias
    useEffect(() => {
        if (_dbRecords.current) {
            getCategorias();
        }
        return () => {
            _dbRecords.current = false;
        }
    }, []);

    // useEffect para carregar gêneros quando categoria muda
    useEffect(() => {
        if (formData.categoria) {
            getGeneros(formData.categoria);
        } else {
            setGeneros([]);
        }
    }, [formData.categoria]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = (file) => {
        setFormData(prev => ({ ...prev, file }));
        setIsUploading(true);
        setUploadProgress(0);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        // Preview do arquivo
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validações
        if (!formData.file) {
            alert('Por favor, selecione um arquivo');
            return;
        }
        if (!formData.categoria) {
            alert('Por favor, selecione uma categoria');
            return;
        }
        if (generos.length > 0 && !formData.genero) {
            alert('Por favor, selecione um gênero');
            return;
        }
        if (!formData.legenda) {
            alert('Por favor, adicione um título');
            return;
        }

        setIsUploading(true);

        // Create post with all required data
        PostagemService.create(formData.file, formData, usuario)
            .then((response) => {
                setIsUploading(false);
                alert('🎉 Conteúdo publicado com sucesso!');
                // Reset form
                setPreview(null);
                setActiveStep(1);
                setFormData({
                    legenda: '',
                    descricao: '',
                    categoria: null,
                    genero: null,
                    file: null
                });
            })
            .catch((error) => {
                setIsUploading(false);
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();
                alert('Erro ao publicar: ' + resMessage);
            });
    };

    const nextStep = () => {
        if (activeStep < 3) setActiveStep(activeStep + 1);
    };

    const prevStep = () => {
        if (activeStep > 1) setActiveStep(activeStep - 1);
    };

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

                                <div
                                    className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {preview ? (
                                        <div className="preview-container">
                                            {formData.file?.type.startsWith('image/') && (
                                                <img src={preview} alt="Preview" className="preview-image" />
                                            )}
                                            {formData.file?.type.startsWith('video/') && (
                                                <video src={preview} controls className="preview-video" />
                                            )}
                                            {formData.file?.type.startsWith('audio/') && (
                                                <div className="audio-preview">
                                                    <div className="audio-icon">🎵</div>
                                                    <p>{formData.file.name}</p>
                                                </div>
                                            )}
                                            <button type="button" className="change-file" onClick={(e) => {
                                                e.stopPropagation();
                                                setPreview(null);
                                                setFormData(prev => ({ ...prev, file: null }));
                                            }}>Alterar Arquivo</button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <div className="upload-icon">📁</div>
                                            <h4>Arraste seu arquivo aqui</h4>
                                            <p>ou clique para selecionar</p>
                                            <div className="supported-formats">
                                                <span>Imagens</span> • <span>Vídeos</span> • <span>Áudios</span> • <span>Documentos</span>
                                            </div>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div className="upload-progress">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                    style={{ display: 'none' }}
                                />

                                <div className="category-selection">
                                    <h4>🎯 Selecione a Categoria</h4>
                                    <div className="categories-grid">
                                        {categorias.map(cat => (
                                            <div key={cat.id}
                                                className={`category-card ${formData.categoria === cat.id ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, categoria: cat.id, genero: null }));
                                                }}
                                            >
                                                <div className="category-icon">
                                                    <img src={`/assets/icons/${cat.icone}.png`} alt="" />
                                                </div>
                                                <h5>{cat.nome}</h5>
                                                <p>{cat.descricao}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="step-content">
                                <h3>📝 Informações do Conteúdo</h3>

                                {generos.length > 0 ? (
                                    <div className="category-selection">
                                        <h4>🎯 Selecione o Gênero</h4>
                                        <div className="categories-grid">
                                            {generos.map(genero => (
                                                <div key={genero.id}
                                                    className={`category-card ${formData.genero === genero.id ? 'selected' : ''}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, genero: genero.id }))}
                                                >
                                                    <h5>{genero.nome}</h5>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-genres-message">
                                        <p>⚠️ Nenhum gênero disponível para esta categoria</p>
                                    </div>
                                )}

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="legenda">📌 Título *</label>
                                        <input
                                            type="text"
                                            id="legenda"
                                            name="legenda"
                                            value={formData.legenda}
                                            onChange={handleInputChange}
                                            placeholder="Digite um título atrativo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="descricao">📄 Descrição</label>
                                    <textarea
                                        id="descricao"
                                        name="descricao"
                                        value={formData.descricao}
                                        onChange={handleInputChange}
                                        placeholder="Conte a história por trás da sua criação..."
                                        rows="5"
                                    />
                                    <div className="char-count">{formData.descricao.length}/500</div>
                                </div>

                            </div>
                        )}

                        <div className="form-actions">
                            {activeStep > 1 && (
                                <button type="button" onClick={prevStep} className="btn-secondary">
                                    ← Voltar
                                </button>
                            )}

                            {activeStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn-primary"
                                    disabled={activeStep === 1 && (!formData.file || !formData.categoria)}
                                >
                                    Próximo →
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn-publish"
                                    disabled={isUploading || !formData.legenda}
                                >
                                    {isUploading ? '🚀 Publicando...' : '🎉 Publicar Agora'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default PostagemNova;