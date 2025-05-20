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




  //funcion para envío de emails con emailjs
  function sendEmail() {
    let params = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value
    };
    emailjs.send("service_81xkq0a", "template_45ha295", params).then(alert("Email sent successfully!"))
}

