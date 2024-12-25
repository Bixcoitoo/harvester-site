let captchaToken = null;

// Inicializa reCAPTCHA
function initRecaptcha() {
    try {
        grecaptcha.render('g-recaptcha', {
            'sitekey': API_CONFIG.SITE_KEY,
            'callback': (token) => {
                captchaToken = token;
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar reCAPTCHA:', error);
    }
}

async function updateDownloadsCount() {
    try {
        const response = await fetch(`${API_CONFIG.URL}/api/downloads/remaining`, {
            headers: {
                'Content-Type': 'application/json',
                'Canvas-Fingerprint': await getFingerprint()
            }
        });
        
        if (!response.ok) throw new Error('Erro ao obter downloads restantes');
        
        const data = await response.json();
        document.getElementById('downloads-count').textContent = 
            `${data.remaining}/${data.total} downloads restantes`;
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
    }
}

async function handleDownload() {
    const url = document.getElementById('videoUrl').value;
    const format = document.querySelector('input[name="format"]:checked').value;
    const statusElement = document.getElementById('download-status');

    if (!url) {
        statusElement.textContent = 'Por favor, insira uma URL válida';
        return;
    }

    if (!captchaToken) {
        statusElement.textContent = 'Por favor, complete o reCAPTCHA';
        return;
    }

    try {
        statusElement.textContent = 'Iniciando download...';
        
        const response = await fetch(`${API_CONFIG.URL}/api/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Canvas-Fingerprint': await getFingerprint()
            },
            body: JSON.stringify({ 
                url, 
                format,
                recaptchaToken: captchaToken 
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro ao iniciar download');
        }

        statusElement.textContent = 'Download iniciado! Aguarde...';
        checkDownloadStatus(data.downloadId);
        updateDownloadsCount();
        
    } catch (error) {
        statusElement.textContent = `Erro: ${error.message}`;
        console.error('Erro:', error);
    } finally {
        grecaptcha.reset();
        captchaToken = null;
    }
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    updateDownloadsCount();
    initRecaptcha();
});
