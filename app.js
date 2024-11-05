// Array para almacenar las publicaciones
let posts = [];

// Función para crear una nueva publicación
function createPost(content) {
    const post = {
        id: Date.now(),
        content: content,
        likes: 0,
        timestamp: new Date().toLocaleString()
    };
    posts.unshift(post);
    displayPosts();
}

// Función para mostrar las publicaciones
function displayPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-content">
                <p>${post.content}</p>
                <div class="post-info">
                    <span>${post.timestamp}</span>
                    <button onclick="likePost(${post.id})">
                        Me gusta (${post.likes})
                    </button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Función para dar "me gusta" a una publicación
function likePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        displayPosts();
    }
}

// Evento para crear nueva publicación
document.getElementById('postBtn').addEventListener('click', () => {
    const textarea = document.querySelector('.post-form textarea');
    const content = textarea.value.trim();
    
    if (content) {
        createPost(content);
        textarea.value = '';
    }
});

// Agregar algunos posts de ejemplo
createPost('¡Bienvenidos a mi red social!'); 