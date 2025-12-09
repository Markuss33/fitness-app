// VKEmbedPlayer.js
import React from 'react';

const VKEmbedPlayer = ({ embedCode, title = "Видео упражнения" }) => {
  if (!embedCode) {
    return (
      <div style={styles.error}>
        Код для встраивания видео не указан
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <div 
        style={styles.embedContainer}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
      <div style={styles.info}>
        <span style={styles.note}>Видео загружается через VK Player</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    margin: '1rem 0',
  },
  title: {
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #eee',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  embedContainer: {
    position: 'relative',
    paddingBottom: '56.25%', // 16:9 aspect ratio
    height: 0,
    overflow: 'hidden',
    '& iframe': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
    },
  },
  info: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f9f9f9',
    borderTop: '1px solid #eee',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#666',
  },
  note: {
    fontStyle: 'italic',
  },
  error: {
    padding: '2rem',
    textAlign: 'center',
    color: '#dc3545',
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    border: '1px solid #ffeaa7',
  },
};

export default VKEmbedPlayer;