async function generateFingerprint() {
    // Coleta dados do navegador
    const fingerprint = {
        screen: `${window.screen.width},${window.screen.height},${window.screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
    };

    // Gera fingerprint do canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125,1,62,20);
    ctx.fillStyle = "#069";
    ctx.fillText("Harvester:)", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Harvester:)", 4, 17);
    
    fingerprint.canvas = canvas.toDataURL();

    return fingerprint;
}

// Adiciona os headers em todas as requisições
fetch = new Proxy(fetch, {
    apply: async (target, thisArg, args) => {
        const [url, options = {}] = args;
        const fingerprint = await generateFingerprint();
        
        options.headers = {
            ...options.headers,
            'Canvas-Fingerprint': fingerprint.canvas,
            'Timezone': fingerprint.timezone,
            'Accept-Language': fingerprint.language,
        };
        
        return target.call(thisArg, url, options);
    }
}); 

async function apply(url, options = {}) {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://harvesterdownloader.site'
        };
        
        // Sempre usar credentials: 'include'
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            },
            credentials: 'include',
            mode: 'cors'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
} 