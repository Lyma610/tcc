import { useState } from 'react';
import ArtworkCard from '../ArtworkCard/ArtworkCard';
import './TrendingSection.css';

function TrendingSection({ title, color, artworks, onArtworkClick }) {
  const [startIdx, setStartIdx] = useState(0);
  const cardsPerPage = 5;
  const endIdx = startIdx + cardsPerPage;
  const canGoLeft = startIdx > 0;
  const canGoRight = endIdx < artworks.length;

  const handleLeft = () => {
    if (canGoLeft) setStartIdx(startIdx - cardsPerPage);
  };
  const handleRight = () => {
    if (canGoRight) setStartIdx(startIdx + cardsPerPage);
  };

  // Para transição suave
  const cardWidth = 250 + 18; // largura do card + gap (ajuste se necessário)
  const translateX = -startIdx * cardWidth;

  return (
    <section className="trending-section" style={{ background: color }}>
      <h3 className="trending-title">{title}</h3>
      <div className="trending-carousel">
        <button className="carousel-arrow left" onClick={handleLeft} disabled={!canGoLeft}>&lt;</button>
        <div className="trending-list-viewport">
          <div
            className="trending-list"
            style={{ transform: `translateX(${translateX}px)` }}
          >
            {artworks.map((art, idx) => (
              <ArtworkCard
                key={idx}
                title={art.title}
                artist={art.artist}
                cover={art.cover}
                onClick={onArtworkClick ? () => onArtworkClick(art) : undefined}
              />
            ))}
          </div>
        </div>
        <button className="carousel-arrow right" onClick={handleRight} disabled={!canGoRight}>&gt;</button>
      </div>
    </section>
  );
}

export default TrendingSection; 