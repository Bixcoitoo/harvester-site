import { useState } from 'react';

export function Download() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://seu-ip:3000/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar download');
      }

      // Cria um link temporário para download
      const downloadUrl = `http://seu-ip:3000${data.downloadUrl}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.click();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="download-section" id="download">
      <div className="container">
        <div className="download-content">
          <h2>Download de Músicas e Vídeos</h2>
          <p>Cole o link do vídeo abaixo para começar o download</p>

          <form onSubmit={handleDownload}>
            <input
              type="text"
              placeholder="Cole o link aqui..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />

            <div className="format-selector">
              <button
                type="button"
                className={format === 'mp3' ? 'active' : ''}
                onClick={() => setFormat('mp3')}
              >
                MP3
              </button>
              <button
                type="button"
                className={format === 'mp4' ? 'active' : ''}
                onClick={() => setFormat('mp4')}
              >
                MP4
              </button>
            </div>

            <button 
              type="submit" 
              className="download-button"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Baixar Agora'}
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </section>
  );
} 