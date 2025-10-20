import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ArtesDigitais from './pages/ArtesDigitais/ArtsDigitais';
import Fotografias from './pages/Fotografias/Fotografia';
import Filmes from './pages/Filmes/Films';
import Musicas from './pages/Musicas/Musics';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/artes-digitais" element={<ArtesDigitais />}/>
      <Route path="/fotografias" element={<Fotografias />}/>
      <Route path="/filmes" element={<Filmes />}/>
      <Route path="/musicas" element={<Musicas />}/>
      <Route path="/home" element={<Home />}/>
      <Route path="/" element={<Login/>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
