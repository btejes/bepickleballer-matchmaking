import React, { useState, useEffect } from 'react';

const TextFirework = ({ char, style }) => (
  <span style={{ 
    position: 'absolute', 
    ...style,
    transition: 'all 0.5s ease-out',
  }}>
    {char}
  </span>
);

const SimpleMatchModal = ({ isOpen, onClose, basePath }) => {
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const createFireworks = () => {
        const newFireworks = [];
        for (let i = 0; i < 20; i++) {
          newFireworks.push({
            char: ['✨', '🎉', '🎊', '💥'][Math.floor(Math.random() * 4)],
            style: {
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              opacity: 1,
            }
          });
        }
        setFireworks(newFireworks);
        
        setTimeout(() => {
          setFireworks(fw => fw.map(f => ({ ...f, style: { ...f.style, opacity: 0 } })));
        }, 800);
      };

      createFireworks(); // Initial fireworks

      const fireworksInterval = setInterval(createFireworks, 1000);

      return () => {
        clearInterval(fireworksInterval);
        setFireworks([]);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {fireworks.map((fw, index) => (
        <TextFirework key={`${index}-${fw.style.top}-${fw.style.left}`} {...fw} />
      ))}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '300px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: 'green', marginBottom: '10px' }}>CONGRATULATIONS!</h2>
        <p style={{ color: 'black', marginBottom: '20px' }}>You both approved this match. Check "Your Matches" to get your match's contact information.</p>
        <a href={`${basePath}/matches`} style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '10px',
          width: '100%',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Go to My Matches
        </a>
        <button onClick={onClose} style={{
          backgroundColor: 'lightgray',
          padding: '10px',
          border: 'none',
          borderRadius: '5px',
          width: '100%',
          cursor: 'pointer',
        }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SimpleMatchModal;
