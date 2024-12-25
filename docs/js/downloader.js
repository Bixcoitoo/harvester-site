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

// Verifica se API_URL já existe globalmente
if (typeof API_URL === 'undefined') {
    const API_URL = 'https://harvester-api-three.vercel.app/api';
}

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

// Função para obter downloads restantes
async function checkRemainingDownloads() {
    try {
        const response = await fetch(`${API_URL}/downloads/remaining`);
        const data = await response.json();
        document.getElementById('downloadsCount').textContent = 
            `${data.remaining}/${data.total}`;
    } catch (error) {
        console.error('Erro ao verificar downloads restantes:', error);
    }
}

// Função para verificar status do download
async function checkDownloadStatus(downloadId) {
    try {
        const response = await fetch(`${API_URL}/download/${downloadId}/status`);
        const data = await response.json();
        
        const statusElement = document.getElementById('download-status');
        if (data.status === 'completed') {
            statusElement.textContent = 'Download concluído!';
            checkRemainingDownloads();
        } else if (data.status === 'error') {
            statusElement.textContent = `Erro: ${data.error}`;
        } else {
            statusElement.textContent = `Progresso: ${data.progress}%`;
            setTimeout(() => checkDownloadStatus(downloadId), 1000);
        }
    } catch (error) {
        console.error('Erro ao verificar status:', error);
    }
}

// Função principal de download
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
        
        const response = await fetch(`${API_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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

        statusElement.textContent = 'Download iniciado! Aguarde...';
        checkDownloadStatus(data.downloadId);
        
    } catch (error) {
        statusElement.textContent = `Erro: ${error.message}`;
        console.error('Erro:', error);
    } finally {
        grecaptcha.reset();
    }
}

// Verifica downloads restantes ao carregar a página
document.addEventListener('DOMContentLoaded', checkRemainingDownloads);

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
  