import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import TrendingSection from '../../components/TrendingSection/TrendingSection';
import SearchBar from '../../components/SearchBar/SearchBar';
import PostagemService from '../../services/PostagemService';
import http from '../../common/http-common';
import './Home.css';
import Splash from '../../components/Splash/Splash';

function Home() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando carregamento de dados...');
        
        // Primeiro vamos buscar todas as postagens
        const todasPostagens = await PostagemService.findAll();
        console.log('Response completo:', todasPostagens);
        console.log('Status da resposta:', todasPostagens.status);
        console.log('Dados das postagens:', todasPostagens.data);
        
        // Log detalhado do primeiro post para debug
        if (todasPostagens.data && todasPostagens.data.length > 0) {
          console.log('Estrutura detalhada do primeiro post:', JSON.stringify(todasPostagens.data[0], null, 2));
        }

        // Verificar se temos dados válidos
        if (!todasPostagens?.data) {
          console.log('Resposta inválida da API');
          setError('Resposta inválida do servidor');
          setLoading(false);
          return;
        }

        if (todasPostagens.data.length === 0) {
          console.log('Nenhuma postagem encontrada');
          setError('Nenhuma postagem encontrada no sistema');
          setLoading(false);
          return;
        }

        console.log(`Encontradas ${todasPostagens.data.length} postagens`);

        // Buscar categorias e gêneros
        const [categoriasResponse, generosResponse] = await Promise.all([
          PostagemService.findCategorias(),
          PostagemService.findGeneros()
        ]);

        setCategorias(categoriasResponse.data);
        setGeneros(generosResponse.data);

        // Criar um objeto para armazenar posts por categoria e gênero
        const postsByCategory = {};

        // Agrupar postagens por categoria
        todasPostagens.data.forEach(post => {
          console.log('Processando post:', post);
          
          // Usar categoria.id e genero.id dos objetos aninhados
          const categoriaId = post.categoria?.id;
          const generoId = post.genero?.id;
          
          console.log('IDs:', { categoriaId, generoId });
          
          // Usar os objetos categoria e genero que já vêm no post
          const categoria = post.categoria;
          const genero = post.genero;
          
          console.log('Dados do post:', { 
            categoria: categoria?.nome,
            categoriaId: categoria?.id,
            genero: genero?.nome,
            generoId: genero?.id
          });

          if (categoria) {
            if (!postsByCategory[categoria.nome]) {
              postsByCategory[categoria.nome] = {};
            }
            
            const generoNome = genero?.nome || 'Sem Gênero';
            if (!postsByCategory[categoria.nome][generoNome]) {
              postsByCategory[categoria.nome][generoNome] = [];
            }

            postsByCategory[categoria.nome][generoNome].push(post);
          }
        });

        // Filtrar apenas categorias que têm posts
        const categoriasFiltradas = {};
        Object.entries(postsByCategory).forEach(([categoria, generos]) => {
          const generosComPosts = Object.entries(generos)
            .filter(([_, posts]) => posts.length > 0)
            .reduce((acc, [genero, posts]) => {
              acc[genero] = posts;
              return acc;
            }, {});

          if (Object.keys(generosComPosts).length > 0) {
            categoriasFiltradas[categoria] = generosComPosts;
          }
        });

        console.log('Posts organizados:', categoriasFiltradas);
        setPosts(categoriasFiltradas);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        console.error('Response error:', error.response);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        
        let errorMessage = 'Erro ao carregar dados';
        if (error.response?.data?.message) {
          errorMessage += `: ${error.response.data.message}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para selecionar seções aleatórias
  const getRandomSections = (postsObj, count = 2) => {
    const allSections = [];
    
    // Cria array com todas as combinações categoria/gênero
    Object.entries(postsObj).forEach(([categoria, generosPosts]) => {
      Object.entries(generosPosts).forEach(([genero, postagens]) => {
        allSections.push({ categoria, genero, postagens });
      });
    });
    
    // Embaralha e pega apenas 'count' seções
    const shuffled = [...allSections].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  if (showSplash) return <Splash duration={4000} onFinish={() => setShowSplash(false)} />;
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#fff',
      fontSize: '1.2rem'
    }}>
      Carregando dados...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      color: '#ff4444',
      fontSize: '1.2rem',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>Erro ao carregar os dados</div>
      <div style={{ fontSize: '0.9rem', color: '#999' }}>{error}</div>
    </div>
  );

  if (Object.keys(posts).length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        Nenhuma postagem encontrada
      </div>
    );
  }

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="main-content">
        <h2 className="recent-title">Baseado no que você viu recentemente</h2>

        {getRandomSections(posts, 2).map(({ categoria, genero, postagens }) => (
          <TrendingSection
            key={`${categoria}-${genero}`}
            title={genero === 'Sem Gênero' ? `#BOMBANDO em ${categoria}` : `#BOMBANDO em ${genero} - ${categoria}`}
            color={genero?.toLowerCase().includes('terror') 
              ? "linear-gradient(90deg, #ff3c3c 0%, #b92b27 100%)"
              : "linear-gradient(0deg, #00ff66 0%, #00bfff 100%)"
            }
            artworks={postagens.map(post => ({
              title: post.legenda || 'Sem título',
              artist: post.usuario?.nome || 'Artista Desconhecido',
              cover: post.id 
                ? `${http.mainInstance.defaults.baseURL}postagem/image/${post.id}`
                : 'https://placehold.co/400x400?text=Sem+Imagem',
              id: post.id
            }))}
            onArtworkClick={art => navigate(`/postagem/${art.id}`)}
          />
        ))}
      </main>
    </div>
  );
}

export default Home;