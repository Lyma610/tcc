import './ArtworkCard.css';


function ArtworkCard({ cover, title, artist, onClick }) {
  return (
    <div className="artwork-card" style={onClick ? { cursor: 'pointer' } : {}} onClick={onClick}>
      <img 
        src={cover} 
        alt={title} 
        className="artwork-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/400x400?text=Sem+Imagem';
        }}
        loading="lazy"
      />
      <div className="artwork-info">
        <span className="artwork-title">{title}</span>
        {artist && <span className="artwork-artist">{artist}</span>}
      </div>
    </div>
  );
}

export default ArtworkCard; 