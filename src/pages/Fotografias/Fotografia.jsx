import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Fotografia.css';
import logo from '../../assets/images/um.png';
import { useParams } from 'react-router-dom';
import PostagemService from '../../services/PostagemService';
import GeneroService from '../../services/GeneroService';

function Fotografia() {
  const { id } = useParams();
  const [postagens, setPostagens] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  // 🔄 Carrega postagens e gêneros ao montar
  useEffect(() => {
    PostagemService.findByCategoriaAndGenero(id, selectedGenreId)
      .then(response => {
        setPostagens(response.data); 
      })
      .catch(console.log);

    GeneroService.findByCategoria(id)
      .then(response => {
        setGeneros(response.data)
      })
      .catch(console.log);
  }, [id, selectedGenreId]);

  useEffect(() => {
    setSlideIndex(0);
  }, [postagens]);

  useEffect(() => {
    if (postagens.length === 0) return;
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % postagens.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [postagens.length]);

  const plusSlides = (n) => {
    setSlideIndex(prev => (prev + n + postagens.length) % postagens.length);
  };

  const currentSlide = (n) => {
    setSlideIndex(n - 1);
  };

  return (
    <div className='layout'>
      <Sidebar />
      <main className='main-content'>
        <div className="genre-selection">
          <h5>🎯 Selecione o Gênero</h5>
          <div className="genres-grid">
            <div
              className={`genre-card ${selectedGenreId === 0 ? 'selected' : ''}`}
              onClick={() => setSelectedGenreId(0)}
            >
              <h5>Todos</h5>
            </div>
            {generos.map(genero => (
              <div
                key={genero.id}
                className={`genre-card ${selectedGenreId === genero.id ? 'selected' : ''}`}
                onClick={() => setSelectedGenreId(genero.id)}
              >
                <h5>{genero.nome}</h5>
              </div>
            ))}
          </div>
        </div>
        {postagens.length === 0 ? (
          <p style={{ textAlign: 'center' }}>Nenhuma postagem encontrada.</p>
        ) : (
          <div className="slideshow-container">
            {postagens.map((postagem, index) => (
              <div
                key={index}
                className={`mySlides fade ${slideIndex === index ? 'active' : ''}`}
                style={{ display: slideIndex === index ? 'block' : 'none' }}
              >
                <div className="numbertext">{index + 1} / {postagens.length}</div>
                <img
                  src={postagem.conteudo ? `data:image/jpeg;base64,${postagem.conteudo}` : logo}
                  style={{ width: '100%' }}
                  alt={`Slide ${index + 1}`}
                />
                <div className="text">{postagem.legenda}</div>
              </div>
            ))}

            <button className="prev" onClick={() => plusSlides(-1)}>❮</button>
            <button className="next" onClick={() => plusSlides(1)}>❯</button>
          </div>
        )}
        <br />

        <div className="dots-wrapper" style={{ textAlign: 'center' }}>
          {postagens.map((_, index) => (
            <span
              key={index}
              className={`dot ${slideIndex === index ? 'active' : ''}`}
              onClick={() => currentSlide(index + 1)}
            ></span>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Fotografia;
