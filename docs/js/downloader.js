async function handleDownload() {
    const url = document.getElementById('videoUrl').value;
    const format = document.getElementById('formatType').value;
    const statusElement = document.getElementById('download-status');
    const recaptchaResponse = grecaptcha.getResponse();

    if (!url) {
        statusElement.textContent = 'Por favor, insira uma URL válida';
        return;
    }

    if (!recaptchaResponse) {
        statusElement.textContent = 'Por favor, complete o reCAPTCHA';
        return;
    }

    try {
        statusElement.textContent = 'Iniciando download...';
        
        const response = await fetch('https://harvester-api-three.vercel.app/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Canvas-Fingerprint': await getFingerprint()
            },
            body: JSON.stringify({ 
                url, 
                format,
                recaptchaToken: recaptchaResponse 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao iniciar download');
        }

        if (!data.downloadId) {
            throw new Error('ID do download não recebido');
        }

        await checkDownloadStatus(data.downloadId);
        
    } catch (error) {
        statusElement.textContent = `Erro: ${error.message}`;
        console.error('Erro:', error);
    } finally {
        grecaptcha.reset();
    }
}

async function checkDownloadStatus(downloadId) {
    const statusElement = document.getElementById('download-status');
    
    try {
        const response = await fetch(`https://harvester-api-three.vercel.app/api/download/${downloadId}/status`);
        const data = await response.json();
        
        if (data.status === 'completed') {
            window.location.href = `https://harvester-api-three.vercel.app/api/download/${downloadId}/file`;
            updateDownloadsCount();
        } else if (data.status === 'error') {
            statusElement.textContent = `Erro: ${data.error}`;
        } else {
            statusElement.textContent = `Progresso: ${data.progress}%`;
            setTimeout(() => checkDownloadStatus(downloadId), 1000);
        }
    } catch (error) {
        statusElement.textContent = 'Erro ao verificar status do download';
    }
}

async function updateDownloadsCount() {
    try {
        const response = await fetch(`${API_CONFIG.URL}/downloads/remaining`, {
            headers: {
                'Canvas-Fingerprint': await getFingerprint()
            }
        });
        const data = await response.json();
        document.getElementById('downloadsCount').textContent = 
            `${data.remaining}/${data.total}`;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
    }
}

// Atualiza contador ao carregar a página
document.addEventListener('DOMContentLoaded', updateDownloadsCount);
