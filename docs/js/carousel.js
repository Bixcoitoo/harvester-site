document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let currentIndex = 0;
    let startX;
    let currentX;
    let isDragging = false;
    let initialPosition = 0;

    // Adiciona indicadores de slides (2 em 2)
    const indicators = document.createElement('div');
    indicators.className = 'carousel-indicators';
    document.querySelector('.carousel').appendChild(indicators);

    // Calcula o número de pares de slides
    const totalPairs = Math.ceil(items.length / 2);

    for (let i = 0; i < totalPairs; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i * 2));
        indicators.appendChild(dot);
    }

    function updateCarousel(position, animate = true) {
        if (animate) {
            carousel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            carousel.style.transition = 'none';
        }

        // Ajuste para loop infinito com 2 slides por vez
        const maxPosition = -((Math.ceil(items.length / 2) - 1) * 100);
        
        if (position > 0) {
            position = maxPosition;
            currentIndex = items.length - 2;
        } else if (position < maxPosition) {
            position = 0;
            currentIndex = 0;
        }

        carousel.style.transform = `translateX(${position}%)`;
        updateDots();
    }

    function updateDots() {
        document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', Math.floor(currentIndex / 2) === index);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel(-Math.floor(index / 2) * 100);
    }

    // Eventos de touch e mouse
    carousel.addEventListener('mousedown', startDragging);
    carousel.addEventListener('touchstart', startDragging);
    carousel.addEventListener('mousemove', drag);
    carousel.addEventListener('touchmove', drag);
    carousel.addEventListener('mouseup', endDragging);
    carousel.addEventListener('touchend', endDragging);
    carousel.addEventListener('mouseleave', endDragging);

    function startDragging(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
        initialPosition = -Math.floor(currentIndex / 2) * 100;
        carousel.style.transition = 'none';
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
        const diff = (currentX - startX) / carousel.offsetWidth * 100;
        const position = initialPosition + diff;
        updateCarousel(position, false);
    }

    function endDragging() {
        if (!isDragging) return;
        isDragging = false;
        const movePercent = ((currentX - startX) / carousel.offsetWidth) * 100;

        if (Math.abs(movePercent) > 20) {
            if (movePercent > 0) {
                currentIndex = Math.max(currentIndex - 2, 0);
            } else {
                currentIndex = Math.min(currentIndex + 2, items.length - 2);
            }
        }
        
        updateCarousel(-Math.floor(currentIndex / 2) * 100);
    }

    // Botões de navegação
    prevButton.addEventListener('click', () => {
        currentIndex = Math.max(currentIndex - 2, 0);
        if (currentIndex < 0) {
            currentIndex = items.length - 2;
        }
        updateCarousel(-Math.floor(currentIndex / 2) * 100);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = Math.min(currentIndex + 2, items.length - 2);
        if (currentIndex >= items.length) {
            currentIndex = 0;
        }
        updateCarousel(-Math.floor(currentIndex / 2) * 100);
    });

    // Auto-play com pausa ao hover
    let autoplayInterval;

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            currentIndex = currentIndex + 2 >= items.length ? 0 : currentIndex + 2;
            updateCarousel(-Math.floor(currentIndex / 2) * 100);
        }, 5000);
    }

    carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
}); 