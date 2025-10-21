import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ArtesDigitais from './pages/ArtesDigitais/ArtsDigitais';
import Fotografias from './pages/Fotografias/Fotografia';
import Filmes from './pages/Filmes/Films';
import Musicas from './pages/Musicas/Musics';
import Perfil from './pages/Perfil/Perfil';
import Publicar from './pages/Publicar/Publicar';
import Explorar from './pages/Explorar/Explorar';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import Obras from './pages/Obras/Obra';
import PostagemDetalhe from './pages/Postagem/PostagemDetalhe';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/obras" element={<Obras />} />
        <Route path="/postagem/:id" element={<PostagemDetalhe />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/publicar" element={<Publicar />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/artes-digitais" element={<ArtesDigitais />} />
        <Route path="/fotografias" element={<Fotografias />} />
        <Route path="/filmes" element={<Filmes />} />
        <Route path="/musicas" element={<Musicas />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
