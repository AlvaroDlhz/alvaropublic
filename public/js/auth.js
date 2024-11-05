document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        cedula: document.getElementById('cedula').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        ciudad: document.getElementById('ciudad').value
    };

    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token
            localStorage.setItem('token', data.token);
            
            // Mostrar mensaje de éxito
            alert('Registro exitoso');
            
            // Redireccionar
            window.location.href = '/dashboard.html';
        } else {
            alert(data.mensaje || 'Error en el registro');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});