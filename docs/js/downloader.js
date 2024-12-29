// Configuração da API
const API_URL = (() => {
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
        return 'http://localhost:4216';
    }
    return 'http://170.231.166.109:4216';
})();

console.log('API URL configurada:', API_URL);

// Configuração do hCaptcha
window.onloadCallback = function() {
    const captchaElement = document.getElementById('h-captcha');
    if (captchaElement) {
        try {
            console.log('Inicializando hCaptcha...');
            hcaptcha.render(captchaElement, {
                'sitekey': '20000000-ffff-ffff-ffff-000000000002',
                'theme': 'light',
                'callback': function(token) {
                    console.log('hCaptcha verificado com sucesso');
                    onCaptchaSuccess(token);
                },
                'expired-callback': onCaptchaExpired,
                'error-callback': function(err) {
                    console.error('Erro no hCaptcha:', err);
                    onCaptchaExpired();
                }
            });
        } catch (error) {
            console.error('Erro ao inicializar hCaptcha:', error);
        }
    } else {
        console.error('Elemento hCaptcha não encontrado');
    }
};

let captchaToken = null;

function onCaptchaSuccess(token) {
    captchaToken = token;
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
    }
}

function onCaptchaExpired() {
    captchaToken = null;
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = true;
    }
    hcaptcha.reset();
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
            },
            mode: 'cors',
            credentials: 'include'
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
    const downloadBtn = document.getElementById('downloadBtn');
    const statusDiv = document.getElementById('download-status');
    
    if (!captchaToken) {
        showError('Por favor, complete o captcha');
        return;
    }

    try {
        downloadBtn.disabled = true;
        statusDiv.innerHTML = '<div class="status-message">Iniciando download...</div>';

        const url = document.querySelector('.url-input').value;
        const format = document.querySelector('#formatType').value;

        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({ 
                url,
                format,
                token: captchaToken
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro no servidor: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            showSuccess('Download iniciado com sucesso!');
            startProgressMonitoring(result.downloadId);
        } else {
            throw new Error(result.error || 'Erro ao iniciar download');
        }

    } catch (error) {
        console.error('Erro detalhado:', error);
        statusDiv.innerHTML = `<div class="status-message error">${error.message}</div>`;
        downloadBtn.disabled = false;
        hcaptcha.reset();
        captchaToken = null;
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

async function startProgressMonitoring(downloadId) {
    const statusDiv = document.getElementById('download-status');
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${API_URL}/status/${downloadId}`);
            const data = await response.json();
            
            if (data.status === 'completed') {
                clearInterval(interval);
                statusDiv.innerHTML = '<div class="status-message success">Download concluído! Iniciando download do arquivo...</div>';
                
                // Criar um link temporário para download
                const downloadLink = document.createElement('a');
                downloadLink.href = `${API_URL}/download/${downloadId}`;
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);
                
                try {
                    // Iniciar o download via fetch
                    const downloadResponse = await fetch(`${API_URL}/download/${downloadId}`);
                    if (!downloadResponse.ok) throw new Error('Erro ao baixar arquivo');
                    
                    // Converter a resposta em blob
                    const blob = await downloadResponse.blob();
                    
                    // Criar URL do blob
                    const url = window.URL.createObjectURL(blob);
                    downloadLink.href = url;
                    
                    // Pegar o nome do arquivo do header Content-Disposition
                    const disposition = downloadResponse.headers.get('content-disposition');
                    const fileName = disposition 
                        ? decodeURIComponent(disposition.split('filename*=UTF-8\'\'')[1])
                        : 'download.mp3';
                    
                    downloadLink.download = fileName;
                    downloadLink.click();
                    
                    // Limpar
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(downloadLink);
                    statusDiv.innerHTML = '<div class="status-message success">Download concluído com sucesso!</div>';
                } catch (downloadError) {
                    console.error('Erro no download:', downloadError);
                    statusDiv.innerHTML = '<div class="status-message error">Erro ao baixar arquivo. Tente novamente.</div>';
                }
            } else if (data.status === 'error') {
                clearInterval(interval);
                statusDiv.innerHTML = `<div class="status-message error">Erro: ${data.error}</div>`;
            } else {
                statusDiv.innerHTML = '<div class="status-message">Processando download...</div>';
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            statusDiv.innerHTML = '<div class="status-message error">Erro ao verificar status do download</div>';
            clearInterval(interval);
        }
    }, 1000);
}

// Função de pesquisa
async function searchVideo(query) {
    const statusDiv = document.getElementById('download-status');
    statusDiv.innerHTML = '<div class="status-message">Pesquisando...</div>';

    try {
        const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Erro na pesquisa');
        
        const videos = await response.json();
        
        if (videos.length === 0) {
            statusDiv.innerHTML = '<div class="status-message error">Nenhum vídeo encontrado</div>';
            return;
        }

        // Mostrar resultados
        const resultsHtml = videos.map(video => `
            <div class="video-result" onclick="selectVideo('${video.url}')">
                <img src="${video.thumb}" alt="${video.titulo}">
                <div class="video-info">
                    <h3>${video.titulo}</h3>
                    <p>Duração: ${video.tempo}</p>
                </div>
            </div>
        `).join('');

        statusDiv.innerHTML = `
            <div class="search-results">
                ${resultsHtml}
            </div>
        `;
    } catch (error) {
        statusDiv.innerHTML = '<div class="status-message error">Erro ao pesquisar vídeos</div>';
    }
}

// Função para selecionar vídeo
function selectVideo(url) {
    document.querySelector('.url-input').value = url;
}


