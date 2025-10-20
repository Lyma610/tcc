import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Films.css';
import http from '../../common/http-common';
import { useParams } from 'react-router-dom';
import PostagemService from '../../services/PostagemService';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import Splash from '../../components/Splash/Splash';

function Films() {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoryId = id || 2;
  const [postsByGenre, setPostsByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await PostagemService.findByCategoria(categoryId);
        const postagens = response.data || [];

        const agrupado = postagens.reduce((acc, post) => {
          const generoNome = post.genero?.nome || 'Sem Gênero';
          if (!acc[generoNome]) acc[generoNome] = [];
          acc[generoNome].push(post);
          return acc;
        }, {});

        setPostsByGenre(agrupado);
      } catch (err) {
        console.error('Erro ao carregar filmes:', err);
        setError('Erro ao carregar filmes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  if (showSplash) return <Splash duration={800} onFinish={() => setShowSplash(false)} />;
  if (loading) return <div style={{padding: 24, color: '#fff'}}>Carregando...</div>;
  if (error) return <div style={{padding: 24, color: '#ff7777'}}>{error}</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className='main-content'>
        {Object.entries(postsByGenre).map(([genero, postagens]) => (
          <TrendingSection
            key={genero}
            title={`${genero} - Filmes`}
            color="linear-gradient(90deg, #ff3c3c 0%, #b92b27 100%)"
            artworks={postagens.map(post => ({
              title: post.legenda || 'Sem título',
              artist: post.usuario?.nome || 'Artista Desconhecido',
              cover: post.id ? `${http.mainInstance.defaults.baseURL}postagem/image/${post.id}` : 'https://placehold.co/400x400?text=Sem+Imagem',
              id: post.id
            }))}
            onArtworkClick={art => navigate(`/postagem/${art.id}`)}
          />
        ))}
      </main>
    </div>
  );
}

export default Films;
