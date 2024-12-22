document.addEventListener('DOMContentLoaded', function() {
    // Carregar navbar
    fetch('./components/navbar.html')
        .then(response => response.text())
        .then(data => {
            const navbarPlaceholder = document.getElementById('navbar-placeholder');
            if (navbarPlaceholder) {
                navbarPlaceholder.innerHTML = data;
                initializeNavigation();
            }
        })
        .catch(error => {
            console.error('Erro ao carregar a navbar:', error);
        });

    // Carregar footer
    fetch('./components/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        })
        .catch(error => {
            console.error('Erro ao carregar o footer:', error);
        });

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

    // Verificar onde inserir o modal
    const docsContainer = document.querySelector('.docs-container');
    if (docsContainer) {
        docsContainer.insertAdjacentElement('afterend', modal);
    } else {
        // Se não encontrar .docs-container, inserir antes do footer
        const footer = document.getElementById('footer-placeholder');
        if (footer) {
            footer.insertAdjacentElement('beforebegin', modal);
        } else {
            // Se não encontrar nenhum dos dois, adicionar ao final do body
            document.body.appendChild(modal);
        }
    }

    // Adicionar eventos do modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    // Função para abrir a página de suporte
    window.openSupport = function(event) {
        event.preventDefault();
        modal.style.display = "none";
        window.location.href = 'support.html';
    };

    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// Função para mostrar o modal
function showGuideModal() {
    const modal = document.getElementById('guideModal');
    if (modal) {
        modal.style.display = "block";
    }
}

// Função para download
function handleDownload() {
    const downloadUrl = 'assets/downloads/harvester-setup.exe';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'harvester-setup.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}