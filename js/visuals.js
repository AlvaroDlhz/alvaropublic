/*document.addEventListener('DOMContentLoaded', () => {
    const h2 = document.querySelector('.glassmorfism-title');

    document.addEventListener('mousemove', (event) => {
        const { clientX, clientY } = event;
        const { left, top, width, height } = h2.getBoundingClientRect();
        const h2CenterX = left + width / 2;
        const h2CenterY = top + height / 2;

        const deltaX = clientX - h2CenterX;
        const deltaY = clientY - h2CenterY;

        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        h2.style.transform = `rotate(${angle}deg)`;
    });
});*/


  document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const cards = Array.from(track.children);
    // Duplicar las tarjetas
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  });
