document.addEventListener('DOMContentLoaded', function() {
    // Configuração do AdSense
    const adConfig = {
        client: 'ca-pub-6494012448662315', // Seu ID do publisher
        enable_page_level_ads: true,
        overlays: {text: false, images: false}
    };

    try {
        // Inicializa os containers de anúncios
        const adContainers = document.querySelectorAll('.ad-container');
        
        adContainers.forEach((container, index) => {
            container.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block; min-height:250px;"
                     data-ad-client="${adConfig.client}"
                     data-ad-slot="1234567890"  // Substitua pelo seu ad-slot real
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            `;
        });

        // Verifica se o AdBlock está ativo
        const checkAdBlock = () => {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            document.body.appendChild(testAd);
            
            window.setTimeout(() => {
                if (testAd.offsetHeight === 0) {
                    document.querySelectorAll('.ad-container').forEach(container => {
                        container.innerHTML = `
                            <div class="ad-blocked-message" style="
                                padding: 20px;
                                background: #fff3cd;
                                border: 1px solid #ffeeba;
                                border-radius: 4px;
                                color: #856404;
                                text-align: center;">
                                <p>Por favor, considere desativar seu bloqueador de anúncios para apoiar este site.</p>
                            </div>
                        `;
                    });
                } else {
                    // Inicializa os anúncios se não houver AdBlock
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
                document.body.removeChild(testAd);
            }, 100);
        };

        checkAdBlock();

    } catch (error) {
        console.error('Erro ao inicializar anúncios:', error);
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