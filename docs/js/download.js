// Função para download de vídeos/músicas via API
async function handleUrlDownload() {
    const url = document.querySelector('.url-input').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    
    try {
        const response = await fetch('https://api.harvesterdownloader.site/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: url,
                format: format
            })
        });
        
        const data = await response.json();
        if (data.success) {
            startProgressMonitoring(data.downloadId);
        } else {
            alert('Erro: ' + data.error);
        }
    } catch (error) {
        console.error('Erro ao iniciar download:', error);
        alert('Erro ao iniciar download');
    }
}

// Função para monitorar o progresso do download
async function startProgressMonitoring(downloadId) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`https://api.harvesterdownloader.site/api/download/${downloadId}/status`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                clearInterval(interval);
                window.location.href = `https://api.harvesterdownloader.site/api/download/${downloadId}/file`;
            } else if (data.status === 'error') {
                clearInterval(interval);
                alert('Erro no download: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 1000);
} 