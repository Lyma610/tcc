
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Obra.css';
import http from '../../common/http-common';
import PostagemService from '../../services/PostagemService';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import Splash from '../../components/Splash/Splash';


function Obra() {
  const navigate = useNavigate();
  const [postsByGenre, setPostsByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Busca categorias 4 (Comunidade) e 5 (Obras Literárias)
        const [resp4, resp5, resp6] = await Promise.all([
          PostagemService.findByCategoria(4),
          PostagemService.findByCategoria(5),
          PostagemService.findByCategoria(6)
        ]);
        const posts4 = resp4.data || [];
        const posts5 = resp5.data || [];
        const posts6 = resp6.data || [];

        const postagens = [...posts4, ...posts5, ...posts6];

        const agrupado = postagens.reduce((acc, post) => {
          const generoNome = post.genero?.nome || 'Sem Gênero';
          if (!acc[generoNome]) acc[generoNome] = [];
          acc[generoNome].push(post);
          return acc;
        }, {});

        setPostsByGenre(agrupado);
      } catch (err) {
        console.error('Erro ao carregar obras:', err);
        setError('Erro ao carregar obras.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (showSplash) return <Splash duration={1000} onFinish={() => setShowSplash(false)} />;
  if (loading) return <div style={{padding: 24, color: '#fff'}}>Carregando...</div>;
  if (error) return <div style={{padding: 24, color: '#ff7777'}}>{error}</div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className='main-content'>
        {Object.entries(postsByGenre).map(([genero, postagens]) => (
          <TrendingSection
            key={genero}
            title={`${genero} - Obras Literárias/Fotografias`}
            color="linear-gradient(0deg, #00ff66 0%, #00bfff 100%)"
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

export default Obra;
