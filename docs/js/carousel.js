document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const carouselInner = document.querySelector('.carousel-inner');
    const items = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    
    let currentIndex = 0;
    
    function updateCarousel() {
        const itemWidth = carousel.clientWidth;
        carouselInner.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    }
    
    window.addEventListener('resize', updateCarousel);
    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);
    
    updateCarousel();
}); 