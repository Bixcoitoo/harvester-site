// Configuração da API
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:4214'
    : 'http://br1.bronxyshost.com:4214'; // Altere para seu domínio de produção

// Configuração do reCAPTCHA
window.onloadCallback = function() {
    const recaptchaElement = document.querySelector('.g-recaptcha');
    if (recaptchaElement) {
        grecaptcha.render(recaptchaElement, {
            'sitekey': '6Ld0L6MqAAAAAKsYTwpiDuWO5RwUdbTa8AQBFuh1',
            'callback': onCaptchaSuccess,
            'expired-callback': onCaptchaExpired
        });
    }
};

let recaptchaToken = null;

function onCaptchaSuccess(token) {
    recaptchaToken = token;
    document.getElementById('downloadBtn').disabled = false;
}

function onCaptchaExpired() {
    recaptchaToken = null;
    document.getElementById('downloadBtn').disabled = true;
}



// Função para gerar ID único do usuário
function generateUserId() {
    if (localStorage.getItem('userId')) {
        return localStorage.getItem('userId');
    }
    
    const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('userId', userId);
    return userId;
}

// Função para atualizar o contador
function updateDownloadCounter(limitInfo) {
    const counterElement = document.getElementById('downloadsCount');
    if (counterElement && limitInfo) {
        counterElement.textContent = `${limitInfo.current}/${limitInfo.total}`;
        
        // Adicionar classe quando atingir o limite
        if (limitInfo.current >= limitInfo.total) {
            counterElement.classList.add('limit-reached');
        } else {
            counterElement.classList.remove('limit-reached');
        }
    }
}

// Função para verificar o status do limite
async function checkLimitStatus() {
    try {
        const response = await fetch(`${API_URL}/limit-status`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const limitInfo = await response.json();
        if (limitInfo.success) {
            updateDownloadCounter({
                current: limitInfo.current,
                total: limitInfo.total
            });
        } else {
            throw new Error(limitInfo.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro ao verificar limite:', error);
    }
}

// Função para mostrar mensagens de erro
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

// Função para mostrar mensagens de sucesso
function showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 5000);
    }
}

// Modificar a função handleUrlDownload
async function handleUrlDownload() {
    const url = document.getElementById('videoUrl').value;
    const formatType = document.getElementById('formatType').value;
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('download-status');
    
    if (!url) {
        showError('Por favor, insira uma URL válida');
        return;
    }
    
    if (!url.includes('youtube.com/') && !url.includes('youtu.be/')) {
        showError('Por favor, insira uma URL válida do YouTube');
        return;
    }
    
    if (!recaptchaToken) {
        showError('Por favor, complete o reCAPTCHA');
        return;
    }

    try {
        downloadBtn.disabled = true;
        statusDiv.innerHTML = '<div class="status-message">Verificando reCAPTCHA...</div>';

        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ 
                url: url.trim(),
                format: formatType,
                recaptchaToken 
            })
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);
        
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
        }

        if (data.success) {
            if (data.limitInfo) {
                updateDownloadCounter(data.limitInfo);
            }
            
            statusDiv.innerHTML = '<div class="status-message success">Download iniciado com sucesso!</div>';
            await monitorDownloadStatus(data.downloadId);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    } catch (error) {
        statusDiv.innerHTML = `<div class="status-message error">${error.message}</div>`;
        console.error('Erro detalhado:', error);
    } finally {
        downloadBtn.disabled = false;
        grecaptcha.reset();
        recaptchaToken = null;
    }
}

async function monitorDownloadStatus(downloadId) {
    const statusDiv = document.getElementById('download-status');
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${getCurrentServer()}/status/${downloadId}`);
            const data = await response.json();

            if (data.status === 'completed') {
                return true;
            } else if (data.status === 'error') {
                throw new Error(data.error || 'Erro no download');
            }

            statusDiv.innerHTML = `<div class="status-message step-${(attempts % 7) + 1}">Processando download...</div>`;
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        } catch (error) {
            throw new Error('Erro ao verificar status do download');
        }
    }
    
    throw new Error('Tempo limite de download excedido');
}

// Adicionar event listener quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleUrlDownload);
    }
});

// Iniciar verificação periódica do limite
document.addEventListener('DOMContentLoaded', () => {
    checkLimitStatus(); // Verificar imediatamente
    setInterval(checkLimitStatus, 30000); // Verificar a cada 30 segundos
});


