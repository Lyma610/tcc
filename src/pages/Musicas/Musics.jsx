import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Musics.css';
import http from '../../common/http-common';
import { useParams } from 'react-router-dom';
import PostagemService from '../../services/PostagemService';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import Splash from '../../components/Splash/Splash';

function Musics() {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoryId = id || 1; // músicas
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscar todas as postagens da categoria
        const postsResponse = await PostagemService.findByCategoria(categoryId);
        const postagens = postsResponse.data || [];
        setAllPosts(postagens);
        setFilteredPosts(postagens);

        // Buscar gêneros da categoria
        const genresResponse = await PostagemService.findGenerosByCategoria(categoryId);
        const generos = genresResponse.data || [];
        setGenres(generos);
      } catch (err) {
        console.error('Erro ao carregar músicas:', err);
        setError('Erro ao carregar músicas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  // Filtrar posts quando o gênero selecionado mudar
  useEffect(() => {
    if (selectedGenre === 'all') {
      setFilteredPosts(allPosts);
    } else {
      const filtered = allPosts.filter(post => post.genero?.id === parseInt(selectedGenre));
      setFilteredPosts(filtered);
    }
  }, [selectedGenre, allPosts]);

  if (showSplash) return <Splash duration={800} onFinish={() => setShowSplash(false)} />;
  if (loading) return <div style={{padding: 24, color: '#fff'}}>Carregando...</div>;
  if (error) return <div style={{padding: 24, color: '#ff7777'}}>{error}</div>;

  return (
    <div className="musicas-layout">
      <Sidebar />
      <main className='main-content'>
        {/* Filtros de Gênero - Design Moderno */}
        <div className="modern-filters" style={{ 
          marginBottom: '32px', 
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ 
            color: '#fff', 
            marginBottom: '20px', 
            fontSize: '1.5rem',
            fontWeight: '600',
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            🎵 Filtrar por Gênero
          </h2>
          <div className="filter-buttons" style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              className={`modern-filter-btn ${selectedGenre === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedGenre('all')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: selectedGenre === 'all' 
                  ? 'linear-gradient(135deg, #00ff66 0%, #00bfff 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: selectedGenre === 'all' ? '#000' : '#fff',
                borderRadius: '25px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.95rem',
                fontWeight: '500',
                boxShadow: selectedGenre === 'all' 
                  ? '0 8px 25px rgba(0, 255, 102, 0.4)' 
                  : '0 4px 15px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                minWidth: '80px'
              }}
              onMouseEnter={(e) => {
                if (selectedGenre !== 'all') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGenre !== 'all') {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              🎶 Todas
            </button>
            {genres.map(genre => (
              <button
                key={genre.id}
                className={`modern-filter-btn ${selectedGenre === genre.id.toString() ? 'active' : ''}`}
                onClick={() => setSelectedGenre(genre.id.toString())}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: selectedGenre === genre.id.toString() 
                    ? 'linear-gradient(135deg, #00ff66 0%, #00bfff 100%)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: selectedGenre === genre.id.toString() ? '#000' : '#fff',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  boxShadow: selectedGenre === genre.id.toString() 
                    ? '0 8px 25px rgba(0, 255, 102, 0.4)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '80px'
                }}
                onMouseEnter={(e) => {
                  if (selectedGenre !== genre.id.toString()) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedGenre !== genre.id.toString()) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {genre.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Exibir todas as postagens filtradas */}
        {filteredPosts.length > 0 ? (
          <TrendingSection
            title={selectedGenre === 'all' ? 'Todas as Músicas' : `${genres.find(g => g.id === parseInt(selectedGenre))?.nome} - Músicas`}
            color="linear-gradient(0deg, #00ff66 0%, #00bfff 100%)"
            artworks={filteredPosts.map(post => ({
              title: post.legenda || 'Sem título',
              artist: post.usuario?.nome || 'Artista Desconhecido',
              cover: post.id ? `${http.mainInstance.defaults.baseURL}postagem/image/${post.id}` : 'https://placehold.co/400x400?text=Sem+Imagem',
              id: post.id
            }))}
            onArtworkClick={art => navigate(`/postagem/${art.id}`)}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
            <h3>Nenhuma música encontrada para o gênero selecionado.</h3>
          </div>
        )}
      </main>
    </div>
  );
}

export default Musics;
