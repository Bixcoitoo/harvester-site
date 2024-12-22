const faqData = [
    {
        question: "Como faço para atualizar o Harvester?",
        answer: "O Harvester verifica automaticamente por atualizações ao iniciar. Caso haja uma nova versão disponível, você será notificado."
    },
    {
        question: "Qual a qualidade máxima de download suportada?",
        answer: "O Harvester suporta downloads em alta qualidade: áudio até 320kbps e vídeo até 4K (quando disponível na fonte)."
    },
    {
        question: "O programa é seguro? Por que o Windows Defender mostra um aviso?",
        answer: "Sim, o Harvester é seguro. O aviso do Windows Defender aparece porque o software ainda não possui uma certificação digital, que é um processo custoso para softwares gratuitos. Todo o código fonte está disponível no GitHub para verificação."
    },
    {
        question: "Posso usar o Harvester em outros sistemas operacionais além do Windows?",
        answer: "Atualmente, o Harvester está disponível apenas para Windows 7 ou superior. Estamos considerando suporte para outros sistemas operacionais em versões futuras."
    },
    {
        question: "Como escolher o formato e qualidade do download?",
        answer: "Ao colar o link do conteúdo, o Harvester mostrará automaticamente as opções disponíveis de formato (MP3, MP4) e qualidade. Selecione as opções desejadas antes de iniciar o download."
    },
    {
        question: "Onde ficam salvos os arquivos baixados?",
        answer: "Por padrão, os downloads são salvos na pasta 'Downloads' do seu usuário. Você pode alterar o local de download nas configurações do programa."
    },
    {
        question: "O programa funciona sem internet?",
        answer: "Não, o Harvester necessita de conexão com a internet para funcionar, pois precisa acessar o conteúdo online para realizar os downloads."
    },
    {
        question: "Por que alguns downloads falham?",
        answer: "Downloads podem falhar por diversos motivos: conexão instável com a internet, conteúdo indisponível ou removido, ou restrições da fonte do conteúdo. Tente novamente e, se o problema persistir, verifique se o conteúdo ainda está disponível na fonte."
    },
    {
        question: "Como posso alterar o idioma do programa?",
        answer: "O Harvester detecta automaticamente o idioma do seu sistema. No momento, suportamos Português (BR) e Inglês. Mais idiomas serão adicionados em atualizações futuras."
    },
    {
        question: "É possível fazer download de playlists inteiras?",
        answer: "Sim! O Harvester suporta download de playlists. Basta colar o link da playlist e selecionar quais vídeos você deseja baixar."
    },
    {
        question: "O programa consome muitos recursos do computador?",
        answer: "Não, o Harvester foi desenvolvido para ser leve e eficiente. O consumo de recursos varia de acordo com a quantidade e qualidade dos downloads simultâneos."
    },
    {
        question: "Posso fazer downloads simultâneos?",
        answer: "Sim, o Harvester permite múltiplos downloads simultâneos. O número máximo depende da sua conexão com a internet e dos recursos do seu computador."
    },
    {
        question: "Como faço para desinstalar o Harvester?",
        answer: "Você pode desinstalar através do Painel de Controle do Windows, como qualquer outro programa. Todos os arquivos de configuração serão removidos automaticamente."
    },
    {
        question: "O programa salva meu histórico de downloads?",
        answer: "Sim, o Harvester mantém um histórico dos seus downloads recentes. Você pode limpar este histórico a qualquer momento através das configurações."
    },
    {
        question: "Existe limite de downloads?",
        answer: "Não há limite no número de downloads que você pode fazer. No entanto, recomendamos respeitar os termos de uso das plataformas de origem do conteúdo."
    }
];

const itemsPerLoad = 5;
let isExpanded = false;

function createFaqItem(question, answer) {
    return `
        <div class="faq-item" style="display: block;">
            <div class="faq-question">
                ${question}
                <span class="toggle">+</span>
            </div>
            <div class="faq-answer">
                ${answer}
            </div>
        </div>
    `;
}

function toggleFaqItems() {
    const faqContainer = document.querySelector('.faq-items');
    const loadMoreBtn = document.getElementById('loadMoreFaq');
    
    if (!isExpanded) {
        // Mostrar todos os itens
        faqContainer.innerHTML = '';
        faqData.forEach(item => {
            faqContainer.insertAdjacentHTML('beforeend', createFaqItem(item.question, item.answer));
        });
        loadMoreBtn.textContent = 'Fechar lista';
        isExpanded = true;
    } else {
        // Mostrar apenas os primeiros 5 itens
        faqContainer.innerHTML = '';
        faqData.slice(0, itemsPerLoad).forEach(item => {
            faqContainer.insertAdjacentHTML('beforeend', createFaqItem(item.question, item.answer));
        });
        loadMoreBtn.textContent = 'Ver mais';
        isExpanded = false;
    }
    
    attachFaqListeners();
}

function attachFaqListeners() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);
        
        newQuestion.addEventListener('click', () => {
            const faqItem = newQuestion.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const toggle = item.querySelector('.toggle');
                if (toggle) toggle.textContent = '+';
            });
            
            if (!isActive) {
                faqItem.classList.add('active');
                const toggle = newQuestion.querySelector('.toggle');
                if (toggle) toggle.textContent = '-';
            }
        });
    });
}

// Inicializa o FAQ
document.addEventListener('DOMContentLoaded', () => {
    const faqContainer = document.querySelector('.faq-items');
    // Mostra os primeiros 5 itens
    faqData.slice(0, itemsPerLoad).forEach(item => {
        faqContainer.insertAdjacentHTML('beforeend', createFaqItem(item.question, item.answer));
    });
    
    // Adiciona evento ao botão
    const loadMoreBtn = document.getElementById('loadMoreFaq');
    loadMoreBtn.addEventListener('click', toggleFaqItems);
    
    attachFaqListeners();
});

// Form submission
document.getElementById('supportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Adicione aqui a lógica para enviar o formulário
    alert('Mensagem enviada com sucesso!');
});
