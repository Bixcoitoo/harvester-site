import api from './api';

export async function startDownload(url: string, format: 'mp3' | 'mp4' = 'mp3') {
  try {
    const response = await api.post('/api/download', {
      url,
      format
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao iniciar download');
  }
}

export async function checkDownloadStatus(downloadId: string) {
  try {
    const response = await api.get(`/api/download/${downloadId}/status`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao verificar status');
  }
}

export async function getRemainingDownloads() {
  try {
    const response = await api.get('/api/downloads/remaining');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Erro ao verificar downloads restantes');
  }
} 