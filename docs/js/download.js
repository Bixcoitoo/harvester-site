// Função para download de vídeos/músicas via API

// Adicionar função para lidar com erros de anúncios
window.onerror = function(msg, url, lineNo, columnNo, error) {
    // Ignorar erros do Google Ads
    if (url && url.includes('googlesyndication.com')) {
        return true; // Previne que o erro apareça no console
    }
    return false; // Permite que outros erros apareçam normalmente
};

// Função para monitorar o progresso do download
async function startProgressMonitoring(downloadId) {
    const statusDiv = document.getElementById('download-status');
    let downloadStarted = false;
    let checkCount = 0;
    const maxChecks = 60; // 2 minutos no máximo (2s * 60)

    statusDiv.innerHTML = '<div class="status-message">Processando download...</div>';
    
    while (checkCount < maxChecks && !downloadStarted) {
        try {
            const response = await fetch(`${API_URL}/status/${downloadId}`);
            const data = await response.json();
            
            console.log('Status atual:', data.status);
            
            if (data.status === 'completed') {
                downloadStarted = true;
                statusDiv.innerHTML = '<div class="status-message">Iniciando download...</div>';
                
                try {
                    const downloadResponse = await fetch(`${API_URL}/download/${downloadId}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'audio/mpeg'
                        }
                    });
                    
                    if (!downloadResponse.ok) {
                        throw new Error(`Erro no download: ${downloadResponse.status}`);
                    }
                    
                    const blob = await downloadResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    
                    const downloadLink = document.createElement('a');
                    downloadLink.style.display = 'none';
                    downloadLink.href = url;
                    downloadLink.download = `${data.title || `download_${downloadId}`}.mp3`;
                    
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(downloadLink);
                        statusDiv.innerHTML = '<div class="status-message success">Download concluído!</div>';
                    }, 100);
                    
                    break;
                } catch (downloadError) {
                    console.error('Erro no download:', downloadError);
                    statusDiv.innerHTML = '<div class="status-message error">Erro ao baixar arquivo</div>';
                }
            } else if (data.status === 'error') {
                statusDiv.innerHTML = `<div class="status-message error">Erro: ${data.error}</div>`;
                break;
            } else {
                statusDiv.innerHTML = `<div class="status-message">Processando download... (${checkCount + 1}/${maxChecks})</div>`;
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Espera 2 segundos entre verificações
            checkCount++;
            
        } catch (error) {
            console.error('Erro na verificação:', error);
            statusDiv.innerHTML = '<div class="status-message error">Erro ao verificar status</div>';
            break;
        }
    }
    
    if (checkCount >= maxChecks && !downloadStarted) {
        statusDiv.innerHTML = '<div class="status-message error">Tempo limite excedido</div>';
    }
} 