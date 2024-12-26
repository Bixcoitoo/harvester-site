// Função para gerar ID único do usuário
function generateUserId() {
    if (localStorage.getItem('userId')) {
        return localStorage.getItem('userId');
    }
    
    const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('userId', userId);
    return userId;
}

async function handleUrlDownload() {
    try {
        const url = document.querySelector('.url-input').value;
        const format = document.querySelector('#formatType').value;
        const userId = generateUserId();

        if (!url) {
            throw new Error('URL é obrigatória');
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            throw new Error('URL inválida. Apenas YouTube é suportado.');
        }

        document.querySelector('.progress-container').style.display = 'block';
        document.querySelector('.progress-bar').style.width = '0%';
        document.querySelector('.progress-text').textContent = 'Iniciando...';

        const serverUrl = getServerUrl();
        const response = await fetch(`${serverUrl}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': userId
            },
            body: JSON.stringify({ 
                url: url.trim(),
                format: format
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao processar download');
        }

        const data = await response.json();
        startProgressMonitoring(data.downloadId);
    } catch (error) {
        document.querySelector('.progress-text').textContent = `Erro: ${error.message}`;
        console.error('Erro:', error);
    }
}

async function startProgressMonitoring(downloadId) {
    const serverUrl = getServerUrl();
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${serverUrl}/status/${downloadId}`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                clearInterval(interval);
                window.location.href = `${serverUrl}/download/${downloadId}`;
            } else if (data.status === 'error') {
                clearInterval(interval);
                alert('Erro no download: ' + data.error);
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 1000);
}


