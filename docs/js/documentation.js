document.addEventListener('DOMContentLoaded', function() {
    // Criar botão do menu mobile
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.setAttribute('aria-label', 'Menu de navegação');
    mobileMenuToggle.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
        </svg>
    `;

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // Adicionar elementos ao DOM
    document.body.appendChild(mobileMenuToggle);
    document.body.appendChild(overlay);

    const sidebar = document.querySelector('.sidebar');
    let isMenuOpen = false;

    // Função para alternar o menu
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
        
        // Atualizar aria-expanded
        mobileMenuToggle.setAttribute('aria-expanded', isMenuOpen);
    }

    // Event listeners
    mobileMenuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Fechar menu ao clicar em links
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768 && isMenuOpen) {
                toggleMenu();
            }
        });
    });

    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu();
        }
    });

    // Prevenir scroll quando o menu está aberto
    document.addEventListener('touchmove', (e) => {
        if (isMenuOpen) {
            e.preventDefault();
        }
    }, { passive: false });

    // Carregar navbar
    fetch('./components/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            initializeNavigation();
        })
        .catch(error => {
            console.error('Erro ao carregar a navbar:', error);
        });

    // Carregar footer
    fetch('./components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => {
            console.error('Erro ao carregar o footer:', error);
        });

    // Inicializar funcionalidade de pesquisa
    initializeSearch();
});

function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            sidebar.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                sidebar.classList.remove('active');
            });
        });
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchDocs');
    const searchResults = document.querySelector('.search-results');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            if (searchTerm.length < 2) {
                searchResults.style.display = 'none';
                return;
            }

            const content = document.querySelectorAll('.doc-section');
            const results = [];

            content.forEach(section => {
                const text = section.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    const title = section.querySelector('h1, h2, h3')?.textContent || 'Seção';
                    const preview = getTextPreview(text, searchTerm);
                    results.push({ title, preview, element: section });
                }
            });

            displaySearchResults(results, searchTerm);
        }, 300));
    }
}

function getTextPreview(text, searchTerm) {
    const index = text.indexOf(searchTerm);
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + 60);
    return '...' + text.slice(start, end) + '...';
}

function displaySearchResults(results, searchTerm) {
    const searchResults = document.querySelector('.search-results');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">Nenhum resultado encontrado</div>';
        searchResults.style.display = 'block';
        return;
    }

    const html = results.map(result => `
        <div class="search-result-item">
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-content">${highlightSearchTerm(result.preview, searchTerm)}</div>
        </div>
    `).join('');

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';

    // Adicionar eventos de clique nos resultados
    document.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            results[index].element.scrollIntoView({ behavior: 'smooth' });
            searchResults.style.display = 'none';
        });
    });
}

function highlightSearchTerm(text, searchTerm) {
    const regex = new RegExp(searchTerm, 'gi');
    return text.replace(regex, match => `<span class="search-highlight">${match}</span>`);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 