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
        const format = document.querySelector('input[name="format"]:checked')?.value || 'mp3';
        const userId = generateUserId();

        // Validação básica da URL
        if (!url) {
            throw new Error('URL é obrigatória');
        }

        // Validar se é uma URL do YouTube ou SoundCloud
        if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('soundcloud.com')) {
            throw new Error('URL inválida. Apenas YouTube e SoundCloud são suportados.');
        }

        document.querySelector('.progress-container').style.display = 'block';
        document.querySelector('.progress-bar').style.width = '0%';
        document.querySelector('.progress-text').textContent = 'Iniciando...';

        const response = await fetch('https://harvester-api-three.vercel.app/api/download', {
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
        updateDownloadsCount();
    } catch (error) {
        document.querySelector('.progress-text').textContent = `Erro: ${error.message}`;
        console.error('Erro:', error);
    }
}

async function updateDownloadsCount() {
    try {
        const userId = localStorage.getItem('userId') || generateUserId();
        localStorage.setItem('userId', userId);

        const response = await fetch('https://harvester-api-three.vercel.app/api/downloads/remaining', {
            method: 'GET',
            headers: {
                'User-Id': userId,
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        document.querySelector('.downloads-remaining').textContent = 
            `Downloads restantes: ${data.remaining}/${data.total}`;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        document.querySelector('.downloads-remaining').textContent = 'Erro ao carregar downloads restantes';
    }
}

async function startProgressMonitoring(downloadId) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`https://harvester-api-three.vercel.app/api/download/${downloadId}/status`);
            const data = await response.json();
            
            const progressBar = document.querySelector('.progress-bar');
            const progressText = document.querySelector('.progress-text');
            
            if (data.status === 'completed') {
                clearInterval(interval);
                progressBar.style.width = '100%';
                progressText.textContent = 'Download Completo!';
                window.location.href = `https://harvester-api-three.vercel.app/api/download/${downloadId}/file`;
            } else if (data.status === 'error') {
                clearInterval(interval);
                progressText.textContent = 'Erro: ' + data.error;
            } else {
                progressBar.style.width = `${data.progress}%`;
                progressText.textContent = `${data.progress}% Concluído`;
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, 1000);
}

// Atualiza contador ao carregar
document.addEventListener('DOMContentLoaded', updateDownloadsCount);
