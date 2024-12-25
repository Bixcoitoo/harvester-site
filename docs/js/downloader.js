// Inicialização do reCAPTCHA
let captchaWidget;
window.onload = async function() {
    try {
        captchaWidget = grecaptcha.render('captcha', {
            'sitekey': config.RECAPTCHA_SITE_KEY,
            'callback': onCaptchaSuccess,
            'expired-callback': onCaptchaExpired
        });
        
        // Apenas inicializa o contador com traços
        const counterElement = document.getElementById('downloadsCount');
        if (counterElement) {
            counterElement.textContent = '-/-';
        }
    } catch (e) {
        console.error('Erro ao inicializar reCAPTCHA:', e);
    }
};

// Callbacks do reCAPTCHA
function onCaptchaSuccess(token) {
    console.log('Captcha completado com sucesso');
}

function onCaptchaExpired() {
    showCaptchaMessage('O captcha expirou. Por favor, complete novamente.', true);
}

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://harvester-api-42f53e6844e5.herokuapp.com';

// Aumenta o intervalo de atualização para 60 segundos
const COUNTER_UPDATE_INTERVAL = 60000; // 60 segundos

// Adicione após as outras constantes
const PREMIUM_KEY = 'premium_active';

function activatePremium(key) {
    if (key.toLowerCase() === 'premium') {
        localStorage.setItem(PREMIUM_KEY, 'true');
        updateDownloadsCount();
        showStatus("✨ Modo Premium ativado!", "Downloads ilimitados desbloqueados");
        return true;
    }
    return false;
}

// Adicione o listener de tecla
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
        const input = document.activeElement;
        if (activatePremium(input.value)) {
            input.value = '';
        }
    }
});

// Função para atualizar o contador de downloads
async function updateDownloadsCount() {
    try {
        const response = await apply(`${API_URL}/api/downloads/remaining`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data && !data.error) {
            const counterElement = document.getElementById('downloadsCount');
            if (counterElement) {
                counterElement.textContent = `${data.remaining}/${data.total}`;
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
    }
}

// Atualiza o contador a cada 30 segundos e após cada download
setInterval(updateDownloadsCount, 30000);

async function startDownload(url, format) {
    try {
        const response = await fetch(`${API_URL}${DOWNLOAD_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Canvas-Fingerprint': await getFingerprint()
            },
            credentials: 'include',
            body: JSON.stringify({ url, format })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Inicia download do arquivo
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = getFilename(url, format);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

        await updateDownloadsCount();
    } catch (error) {
        console.error('Erro no download:', error);
        showError('Erro ao realizar download. Tente novamente.');
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    const status = document.getElementById('download-status');
    status.className = 'status-message error';
    status.textContent = message;
}

function showSuccess(message) {
    const status = document.getElementById('download-status');
    status.className = 'status-message success';
    status.textContent = message;
}

function updateDownloadProgress(progress) {
    showStatus(`Baixando... ${progress.toFixed(1)}%`);
}

function showCaptchaMessage(message, isError = false) {
    const captchaMessage = document.getElementById('captcha-message');
    if (!captchaMessage) {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'captcha-message';
        messageDiv.className = `captcha-message ${isError ? 'error' : 'success'}`;
        const captchaElement = document.getElementById('captcha');
        captchaElement.parentNode.insertBefore(messageDiv, captchaElement.nextSibling);
    }
    
    const messageElement = document.getElementById('captcha-message');
    messageElement.textContent = message;
    messageElement.className = `captcha-message ${isError ? 'error' : 'success'}`;
}

// Atualiza as chamadas no startDownload para incluir mais detalhes
function updateDownloadDetails(filename, size, format) {
    return `
        📁 Arquivo: ${filename}
         Tamanho: ${(size / (1024 * 1024)).toFixed(2)} MB
        🎯 Formato: ${format.toUpperCase()}
    `;
}

function showStatus(message, details = null, progress = null) {
    const statusElement = document.getElementById('download-status');
    if (statusElement) {
        statusElement.className = 'status-message';
        
        let statusHTML = '';
        let statusClass = '';
        
        // Define o estilo baseado no tipo de mensagem
        if (message.includes('Baixando')) {
            statusClass = 'progress';
            statusHTML = `
                <div class="download-progress">
                    <div class="progress-text">${message}</div>
                    ${progress ? `<div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>` : ''}
                </div>`;
        } else if (message.includes('sucesso')) {
            statusClass = 'success';
            statusHTML = message;
        } else if (message.includes('Erro')) {
            statusClass = 'error';
            statusHTML = message;
        } else {
            statusClass = 'info';
            statusHTML = message;
        }

        statusElement.classList.add(statusClass);
        statusElement.innerHTML = `
            <div class="status-main">
                <span class="status-text">${statusHTML}</span>
            </div>
            ${details ? `<div class="status-details">${details}</div>` : ''}
        `;
    }
}

// Chama updateDownloadsCount quando a página carrega
document.addEventListener('DOMContentLoaded', updateDownloadsCount);

// Terminal Console
class TerminalConsole {
    constructor() {
        this.terminal = document.getElementById('console-terminal');
        if (!this.terminal) {
            console.error('Terminal não encontrado no DOM');
            return;
        }
        
        this.output = this.terminal.querySelector('.terminal-output');
        this.input = this.terminal.querySelector('.terminal-input');
        this.closeBtn = this.terminal.querySelector('.terminal-close');
        this.header = this.terminal.querySelector('.terminal-header');
        
        if (!this.output || !this.input || !this.closeBtn || !this.header) {
            console.error('Elementos do terminal não encontrados');
            return;
        }
        
        // Inicialização de variáveis
        this.isOpen = false;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.isLoggedIn = false;
        this.username = '';
        this.loginStep = 0;
        this.tempUsername = '';
        this.API_URL = 'http://seu-servidor:5001';
        this.authToken = '';
        this.updateInterval = null;
        
        // Inicializa os event listeners
        this.initializeEventListeners();
        
        this.commands = {
            'help': {
                desc: 'Mostra todos os comandos disponíveis',
                usage: 'help ou -h',
                action: () => this.showHelp()
            },
            'clear': {
                desc: 'Limpa o terminal',
                usage: 'clear',
                action: () => this.clearTerminal()
            },
            'logout': {
                desc: 'Faz logout do terminal',
                usage: 'logout',
                action: () => this.handleLogout()
            },
            'status': {
                desc: 'Mostra status do sistema',
                usage: 'status',
                action: () => this.showSystemStatus()
            },
            'users': {
                desc: 'Gerencia usuários',
                usage: 'users list|count|info <user_id>',
                action: (args) => this.handleUsers(args)
            },
            'premium': {
                desc: 'Gerencia status premium',
                usage: 'premium add|remove <user_id>',
                action: (args) => this.handlePremium(args)
            },
            'stats': {
                desc: 'Mostra estatísticas',
                usage: 'stats [daily|weekly|monthly]',
                action: (args) => this.handleStats(args)
            },
            'system': {
                desc: 'Informações do sistema',
                usage: 'system info|status',
                action: (args) => this.handleSystem(args)
            }
        };
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key.toLowerCase() === 't') {
                this.toggleTerminal();
            }
        });

        this.closeBtn.addEventListener('click', () => {
            this.toggleTerminal();
        });

        this.terminal.addEventListener('click', () => {
            if (this.isOpen) {
                this.input.focus();
            }
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (!this.isLoggedIn) {
                    this.handleLoginSteps(this.input.value);
                } else {
                    this.processCommand(this.input.value);
                }
                this.input.value = '';
            }
        });
    }

    toggleTerminal() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.terminal.style.display = 'block';
            this.resetTerminal();
            this.initializePosition();
            this.showWelcomeMessage();
            this.input.focus();
        } else {
            this.terminal.style.display = 'none';
            setTimeout(() => {
                this.resetTerminal();
            }, 100);
        }
    }

    showWelcomeMessage() {
        this.printMessage('╔════════════════════════════════════╗', 'info');
        this.printMessage('║     Console do Harvester v1.0      ║', 'info');
        this.printMessage('╚════════════════════════════════════╝', 'info');
        this.printMessage('');
        this.printMessage('🔐 Sistema de autenticação requerido', 'warning');
        this.printMessage('Digite seu usuário:', 'info');
    }

    resetTerminal() {
        this.isLoggedIn = false;
        this.username = '';
        this.loginStep = 0;
        this.tempUsername = '';
        this.xOffset = 0;
        this.yOffset = 0;
        this.currentX = 0;
        this.currentY = 0;
        if (this.output) {
            this.output.innerHTML = '';
        }
        if (this.input) {
            this.input.value = '';
            this.input.type = 'text';
        }
    }

    printMessage(message, type = 'default') {
        const messageElement = document.createElement('div');
        messageElement.className = `terminal-message terminal-${type}`;
        messageElement.textContent = message;
        this.output.appendChild(messageElement);
        
        // Força o scroll para o final
        this.output.scrollTo({
            top: this.output.scrollHeight,
            behavior: 'smooth'
        });
    }

    initializePosition() {
        this.terminal.style.transform = 'none';
        this.terminal.style.left = '50%';
        this.terminal.style.top = '50%';
        this.terminal.style.transform = 'translate(-50%, -50%)';
    }

    handleLoginSteps(value) {
        if (!value.trim()) {
            this.printMessage('❌ O campo não pode estar vazio', 'error');
            return;
        }

        switch(this.loginStep) {
            case 0:
                this.tempUsername = value;
                this.loginStep = 1;
                this.printMessage(`Usuário: ${value}`, 'info');
                this.printMessage('Digite sua senha:', 'info');
                this.input.type = 'password';
                break;
            case 1:
                this.handleLogin(this.tempUsername, value);
                this.input.type = 'text';
                break;
        }
    }

    handleLogin() {
        if (this.loginStep === 1 && this.tempUsername === 'root' && this.input.value === 'root') {
            this.isLoggedIn = true;
            this.username = this.tempUsername;
            this.authToken = 'Bearer root';
            this.loginStep = 2;
            this.output.innerHTML = '';
            this.printMessage('✅ Login realizado com sucesso!', 'success');
            this.printMessage('Digite "help" para ver os comandos disponíveis', 'info');
            
            // Teste imediato do status
            this.showSystemStatus(false);
            
            // Inicia atualizações periódicas
            this.startStatusUpdates();
        } else {
            this.isLoggedIn = false;
            this.loginStep = 0;
            this.tempUsername = '';
            this.printMessage('❌ Usuário ou senha incorretos', 'error');
            this.printMessage('Digite seu usuário:', 'info');
        }
    }

    startStatusUpdates() {
        // Atualiza status a cada 30 segundos
        this.updateInterval = setInterval(() => {
            if (this.isLoggedIn) {
                this.showSystemStatus(true);
            }
        }, 30000);
    }

    async showSystemStatus(silent = false) {
        try {
            const response = await fetch(`${this.API_URL}/api/admin/system/status`, {
                headers: {
                    'Authorization': this.authToken
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro de autenticação');
            }

            const status = await response.json();
            
            if (!silent) {
                this.printMessage('🖥️ Status do Sistema:', 'info');
                this.printMessage(`• CPU: ${status.cpu}%`, 'default');
                this.printMessage(`• Memória: ${status.memory}%`, 'default');
                this.printMessage(`• Uptime: ${status.uptime}`, 'default');
                this.printMessage(`• Redis: ${status.redis ? '✓ Conectado' : '✗ Desconectado'}`, 'default');
                this.printMessage(`• Downloads Hoje: ${status.downloads_today}`, 'default');
                this.printMessage(`• Usuários Ativos: ${status.active_users}`, 'default');
            }
        } catch (error) {
            if (!silent) {
                this.printMessage(`❌ Erro: ${error.message}`, 'error');
            }
        }
    }

    handleLogout() {
        clearInterval(this.updateInterval);
        this.resetTerminal();
        this.printMessage('👋 Logout realizado com sucesso!', 'success');
        this.printMessage('Digite seu usuário:', 'info');
    }

    processCommand(command) {
        if (!command.trim()) return;
        
        const args = command.toLowerCase().trim().split(' ');
        const cmd = args[0];
        
        this.printMessage(`> ${command}`, 'command');
        
        if (this.commands[cmd]) {
            this.commands[cmd].action(args.slice(1));
            // Garante que o scroll aconteça após o comando ser processado
            requestAnimationFrame(() => {
                this.output.scrollTop = this.output.scrollHeight;
            });
        } else {
            this.printMessage(`❌ Comando "${cmd}" não encontrado. Digite "help" para ver os comandos disponíveis.`, 'error');
        }
    }

    showHelp() {
        this.printMessage('📚 Comandos disponíveis:', 'info');
        Object.entries(this.commands).forEach(([cmd, info]) => {
            this.printMessage(`• ${cmd}: ${info.desc}`, 'info');
            this.printMessage(`  Uso: ${info.usage}`, 'default');
        });
    }

    async handleUsers(args) {
        try {
            const action = args[0];
            switch(action) {
                case 'list':
                    const response = await fetch(`${this.API_URL}/api/admin/users/list`, {
                        headers: {
                            'Authorization': this.authToken
                        }
                    });
                    const users = await response.json();
                    this.printMessage('👥 Lista de usuários:', 'info');
                    users.forEach(user => {
                        this.printMessage(`• ID: ${user.id} | ${user.name} | Premium: ${user.isPremium ? '✓' : '✗'}`, 'default');
                    });
                    break;
                case 'count':
                    const countResponse = await fetch(`${this.API_URL}/api/admin/users/count`);
                    const counts = await countResponse.json();
                    this.printMessage('📊 Contagem de usuários:', 'info');
                    this.printMessage(`• Total: ${counts.total}`, 'default');
                    this.printMessage(`• Premium: ${counts.premium}`, 'default');
                    break;
                default:
                    this.printMessage('❌ Ação inválida para users', 'error');
            }
        } catch (error) {
            this.printMessage(`❌ Erro: ${error.message}`, 'error');
        }
    }

    clearTerminal() {
        this.output.innerHTML = '';
        this.printMessage('Terminal limpo', 'info');
    }
}

// Inicializa o terminal quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new TerminalConsole();
});
  