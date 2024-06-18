document.addEventListener('DOMContentLoaded', () => {
    const figures = document.querySelectorAll('.galerie_animata figure');
    let currentImageIndex = 0;
  
    function showNextImage() {
      figures[currentImageIndex].classList.remove('active');
      currentImageIndex = (currentImageIndex + 1) % figures.length;
      figures[currentImageIndex].classList.add('active');
    }
  
    setInterval(showNextImage, 3000); // Schimbă imaginea la fiecare 8 secunde
  });