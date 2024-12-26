const config = {
    servers: {
        production: 'http://br1.bronxyshost.com:4214',
        development: 'http://localhost:4214'
    },
    currentServer: 'production' // ou 'development'
};

function toggleServer() {
    config.currentServer = config.currentServer === 'production' ? 'development' : 'production';
    localStorage.setItem('serverMode', config.currentServer);
    updateServerIndicator();
}

function getServerUrl() {
    return config.servers[config.currentServer];
}

function initServerConfig() {
    const savedMode = localStorage.getItem('serverMode');
    if (savedMode) {
        config.currentServer = savedMode;
    }
    updateServerIndicator();
}

function updateServerIndicator() {
    const indicator = document.querySelector('.server-indicator');
    if (indicator) {
        indicator.textContent = `Servidor: ${config.currentServer === 'production' ? 'Produção' : 'Desenvolvimento'}`;
        indicator.className = `server-indicator ${config.currentServer}`;
    }
} 