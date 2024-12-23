document.addEventListener('DOMContentLoaded', function() {
    const adConfig = {
        client: 'ca-pub-6494012448662315',
        enable_page_level_ads: true,
        overlays: {text: false, images: false}
    };

    try {
        // Verifica se o AdSense está carregado
        if (typeof adsbygoogle === 'undefined') {
            console.warn('AdSense não carregado');
            document.querySelectorAll('.ad-container').forEach(container => {
                container.innerHTML = `
                    <div class="ad-blocked-message">
                        <p>Não foi possível carregar os anúncios. Por favor, desative o bloqueador de anúncios.</p>
                    </div>
                `;
            });
            return;
        }

        // Inicializa os containers
        const adContainers = document.querySelectorAll('.ad-container');
        
        adContainers.forEach((container, index) => {
            container.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block; min-height:250px;"
                     data-ad-client="${adConfig.client}"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            `;
            
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('Erro ao inicializar anúncio:', e);
            }
        });

    } catch (error) {
        console.error('Erro geral nos anúncios:', error);
    }
});

function verificarAds() {
    const ads = document.querySelectorAll('.ad-container');
    ads.forEach((ad, index) => {
        console.log(`Anúncio ${index + 1}:`, {
            visível: ad.offsetParent !== null,
            altura: ad.offsetHeight,
            largura: ad.offsetWidth,
            posição: ad.getBoundingClientRect()
        });
    });
}

// Melhor tratamento para AdSense
window.addEventListener('load', function() {
    try {
        (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.log('AdBlock detectado');
        // Mostra mensagem alternativa
        document.querySelectorAll('.ad-notice').forEach(notice => {
            notice.style.display = 'block';
        });
    }
});

// Desativa mensagens de erro do AdSense
window.onerror = function(msg, url, line, col, error) {
    if (msg.includes('message channel closed') || 
        msg.includes('css_text') || 
        url.includes('ads') || 
        url.includes('anchor') || 
        url.includes('aframe')) {
        return true; // Suprime esses erros
    }
}; 