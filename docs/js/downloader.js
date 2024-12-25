const API_CONFIG = {
    URL: 'https://harvester-api-three.vercel.app/api',
    SITE_KEY: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Chave de teste do reCAPTCHA
};

async function handleDownload() {
    const url = document.getElementById('videoUrl').value;
    const format = document.getElementById('formatType').value;
    const quality = document.getElementById('quality').value;
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
        
        const response = await fetch(`${API_CONFIG.URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Canvas-Fingerprint': await getFingerprint()
            },
            body: JSON.stringify({ 
                url, 
                format,
                quality,
                recaptchaToken: recaptchaResponse 
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao iniciar download');
        }

        const data = await response.json();
        statusElement.textContent = 'Download iniciado! Aguardando processamento...';
        checkDownloadStatus(data.downloadId);
        
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
        const response = await fetch(`${API_CONFIG.URL}/download/${downloadId}/status`);
        const data = await response.json();

        if (data.status === 'completed') {
            statusElement.textContent = 'Download concluído!';
            // Inicia o download do arquivo
            window.location.href = `${API_CONFIG.URL}/download/${downloadId}/file`;
            updateDownloadsCount();
        } else if (data.status === 'error') {
            statusElement.textContent = `Erro: ${data.error}`;
        } else {
            statusElement.textContent = `Progresso: ${data.progress}%`;
            setTimeout(() => checkDownloadStatus(downloadId), 1000);
        }
    } catch (error) {
        statusElement.textContent = 'Erro ao verificar status do download';
        console.error('Erro:', error);
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
