document.addEventListener('DOMContentLoaded', function() {
    // Botão que abre o modal (na seção de download)
    const downloadBtn = document.querySelector('.download-btn');
    if (!downloadBtn) return;

    // Criar o modal
    const modal = document.createElement('div');
    modal.id = 'guideModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="container">
                <h1>Guia de Instalação do Harvester</h1>

                <div class="warning">
                    <h3>⚠️ Aviso do Windows Defender</h3>
                    <p>É normal que o Windows Defender mostre um aviso ao executar o instalador. Isso acontece porque o software ainda não possui uma certificação digital.</p>
                </div>

                <div class="step">
                    <h2 data-number="1">Baixando o Instalador</h2>
                    <p>Após clicar no botão de download, o arquivo <strong>HarvesterSetup.exe</strong> será baixado para seu computador.</p>
                </div>

                <div class="step">
                    <h2 data-number="2">Executando o Instalador</h2>
                    <p>Dê um duplo clique no arquivo baixado e siga as instruções na tela.</p>
                    <div class="note">
                        <p>Se aparecer um aviso do Windows Defender, clique em "Mais informações" e depois em "Executar assim mesmo".</p>
                    </div>
                </div>

                <div class="step">
                    <h2 data-number="3">Concluindo a Instalação</h2>
                    <p>Após a instalação, o Harvester estará pronto para uso. Você encontrará o ícone na sua área de trabalho.</p>
                </div>

                <div class="warning">
                    <h3>📝 Suporte</h3>
                    <p>Em caso de problemas durante a instalação ou uso do programa, consulte nossa <a href="#" onclick="openSupport(event)" style="color: var(--primary-color); text-decoration: none;">página de suporte</a> ou entre em contato através do GitHub.</p>
                </div>

                <button class="start-btn" onclick="handleDownload()">Baixar Agora</button>
            </div>
        </div>
    `;

    // Criar modal de agradecimento
    const thankYouModal = document.createElement('div');
    thankYouModal.id = 'thankYouModal';
    thankYouModal.className = 'modal';
    thankYouModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="container" style="text-align: center;">
                <h2>Obrigado por baixar o Harvester!</h2>
                <p>Seu download começou. Se precisar de ajuda, consulte nossa página de suporte.</p>
                <button class="start-btn" onclick="this.closest('.modal').style.display='none'">Fechar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.appendChild(thankYouModal);

    // Função para mostrar o modal
    window.showGuideModal = function() {
        modal.style.display = 'block';
    };

    // Função para iniciar o download
    window.handleDownload = function() {
        const downloadUrl = 'https://github.com/Bixcoitoo/harvester-site/releases/latest/download/HarvesterSetup.exe';
        
        // Inicia o download
        window.location.href = downloadUrl;
        
        // Mostra o modal de agradecimento após confirmar que o download começou
        setTimeout(() => {
            modal.style.display = 'none';
            thankYouModal.style.display = 'block';
        }, 1000);
    };

    // Fechar modais
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Fechar ao clicar fora dos modais
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Botão que rola até a seção de download
    const scrollToDownloadBtn = document.querySelector('.scroll-to-download');
    if (scrollToDownloadBtn) {
        scrollToDownloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#download').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    }
}); 

function showGuideModal() {
    const modal = document.getElementById('downloadGuideModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function downloadProgram() {
    const downloadUrl = 'https://github.com/bixcoitoo/Harvester/releases/latest/download/Harvester.Setup.exe';
    window.location.href = downloadUrl;
    
    // Fecha o modal após iniciar o download
    setTimeout(() => {
        const modal = document.getElementById('downloadGuideModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }, 1000);
} 