const config = {
    servers: {
        production: 'https://br1.bronxyshost.com:4214',
        development: 'http://localhost:4214'
    },
    api: {
        download: '/download',
        status: '/status',
        limitStatus: '/limit-status',
        baseUrl: window.location.hostname === 'localhost' 
            ? 'http://localhost:4214'
            : 'https://br1.bronxyshost.com:4214'
    },
    recaptcha: {
        siteKey: '6Ld0L6MqAAAAAKsYTwplDuWO5RwUdbTa8AQBFuh1',
        enabled: true
    },
    currentServer: window.location.hostname === 'localhost' ? 'development' : 'production'
};

function getApiUrl(endpoint) {
    const baseUrl = config.servers[config.currentServer];
    return `${baseUrl}${config.api[endpoint]}`;
}

function getCurrentServer() {
    return config.servers[config.currentServer];
}

function toggleServer() {
    config.currentServer = config.currentServer === 'production' ? 'development' : 'production';
    localStorage.setItem('serverMode', config.currentServer);
    updateServerIndicator();
}

function initServerConfig() {
    const savedMode = localStorage.getItem('serverMode');
    if (savedMode && config.servers[savedMode]) {
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