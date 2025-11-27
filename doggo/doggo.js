// =========================================
// DOGGO SOCIAL NETWORK - JAVASCRIPT
// =========================================

// Mock Data
const MOCK_USERS = [
    {
        id: 1,
        name: 'Sarah Chen',
        handle: '@sarahchen',
        avatar: 'https://i.pravatar.cc/150?img=1',
        bio: 'Product designer • Coffee enthusiast • Dog lover 🐕'
    },
    {
        id: 2,
        name: 'Marcus Johnson',
        handle: '@marcusj',
        avatar: 'https://i.pravatar.cc/150?img=12',
        bio: 'Software engineer building cool stuff'
    },
    {
        id: 3,
        name: 'Elena Rodriguez',
        handle: '@elenarod',
        avatar: 'https://i.pravatar.cc/150?img=5',
        bio: 'Digital artist & creative director'
    },
    {
        id: 4,
        name: 'James Park',
        handle: '@jamespark',
        avatar: 'https://i.pravatar.cc/150?img=15',
        bio: 'Startup founder | Tech enthusiast'
    },
    {
        id: 5,
        name: 'Olivia Martinez',
        handle: '@oliviam',
        avatar: 'https://i.pravatar.cc/150?img=9',
        bio: 'UX researcher & design systems advocate'
    },
    {
        id: 6,
        name: 'Alex Kim',
        handle: '@alexkim',
        avatar: 'https://i.pravatar.cc/150?img=14',
        bio: 'Full-stack developer | Open source contributor'
    },
    {
        id: 7,
        name: 'Sophie Turner',
        handle: '@sophiet',
        avatar: 'https://i.pravatar.cc/150?img=10',
        bio: 'Content creator & photographer'
    },
    {
        id: 8,
        name: 'David Lee',
        handle: '@davidlee',
        avatar: 'https://i.pravatar.cc/150?img=13',
        bio: 'Data scientist exploring AI/ML'
    }
];

const MOCK_POST_CONTENT = [
    "Just shipped a new feature! The team worked incredibly hard on this. Can't wait to see what users think 🚀",
    "Hot take: Dark mode is not just a preference, it's a lifestyle choice.",
    "Working on something exciting. Stay tuned for the announcement next week! 👀",
    "The best code is the code you don't have to write. Simplicity wins every time.",
    "Coffee consumption directly correlates with productivity. This is not up for debate ☕",
    "Reminder: Take breaks. Your brain needs rest to solve complex problems.",
    "Just discovered this amazing design pattern. Why didn't I know about this earlier?",
    "Weekend project turned into something bigger. Sometimes the best ideas come when you're not trying.",
    "The intersection of art and technology never ceases to amaze me.",
    "Debugging is like being a detective in a crime movie where you're also the murderer.",
    "New blog post is live! Sharing my thoughts on modern web development.",
    "That feeling when your code works on the first try... suspicious 🤔",
    "Building in public is scary but rewarding. Here's what I learned this month.",
    "Design systems are the unsung heroes of product development.",
    "Just finished reading an incredible book on creative thinking. Highly recommend!"
];

const MOCK_COMMENTS = [
    "This is amazing! Great work 👏",
    "Couldn't agree more with this",
    "Thanks for sharing!",
    "Interesting perspective",
    "Love this! Keep it up",
    "This resonates with me so much",
    "Absolutely brilliant",
    "Can't wait to try this out",
    "So true!",
    "This made my day 😊"
];

// Current user (the logged-in user)
let currentUser = {
    id: 0,
    name: 'Alex Rivera',
    handle: '@alexrivera',
    avatar: 'https://i.pravatar.cc/150?img=8',
    bio: 'Creative developer • Building cool things on the internet',
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop',
    followers: 342,
    following: 189,
    posts: 0
};

// Load user data from localStorage
function loadUserData() {
    const savedUser = localStorage.getItem('doggo_current_user');
    if (savedUser) {
        currentUser = { ...currentUser, ...JSON.parse(savedUser) };
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('doggo_current_user', JSON.stringify(currentUser));
}

// Generate mock posts
function generateMockPosts(count = 10) {
    const posts = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        const content = MOCK_POST_CONTENT[Math.floor(Math.random() * MOCK_POST_CONTENT.length)];
        const timestamp = now - (Math.random() * 86400000 * 3); // Random time within last 3 days
        const likeCount = Math.floor(Math.random() * 150);
        const commentCount = Math.floor(Math.random() * 20);

        // Generate random comments
        const comments = [];
        for (let j = 0; j < commentCount; j++) {
            const commentUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
            comments.push({
                id: `comment-${i}-${j}`,
                user: commentUser,
                text: MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)],
                timestamp: timestamp + (Math.random() * 3600000)
            });
        }

        posts.push({
            id: `post-${i}`,
            user: user,
            content: content,
            timestamp: timestamp,
            likes: likeCount,
            liked: false,
            comments: comments
        });
    }

    return posts.sort((a, b) => b.timestamp - a.timestamp);
}

// Format timestamp
function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Create post card HTML
function createPostCard(post) {
    return `
        <article class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
                <div class="post-user-info">
                    <span class="post-user-name">${post.user.name}</span>
                    <span class="post-user-handle">${post.user.handle}</span>
                </div>
                <span class="post-timestamp">${formatTimestamp(post.timestamp)}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-action="like">
                    <span>${post.liked ? '❤️' : '🤍'}</span>
                    <span class="like-count">${post.likes}</span>
                </button>
                <button class="action-btn comment-btn" data-action="comment">
                    <span>💬</span>
                    <span class="comment-count">${post.comments.length}</span>
                </button>
                <button class="action-btn share-btn" data-action="share">
                    <span>🔄</span>
                    <span>Share</span>
                </button>
            </div>
            <div class="comments-section">
                <div class="comment-form">
                    <textarea class="comment-input" placeholder="Write a comment..." rows="2"></textarea>
                    <button class="comment-submit" disabled>Post</button>
                </div>
                <div class="comments-list">
                    ${post.comments.map(comment => createCommentHTML(comment)).join('')}
                </div>
            </div>
        </article>
    `;
}

// Create comment HTML
function createCommentHTML(comment) {
    return `
        <div class="comment-item">
            <img src="${comment.user.avatar}" alt="${comment.user.name}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-author">${comment.user.name}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        </div>
    `;
}

// Initialize feed page
function initFeedPage() {
    loadUserData();

    const feedColumn = document.querySelector('.feed-column');
    if (!feedColumn) return;

    const posts = generateMockPosts(15);
    feedColumn.innerHTML = posts.map(post => createPostCard(post)).join('');

    // Add event listeners
    document.querySelectorAll('.post-card').forEach(card => {
        const postId = card.dataset.postId;
        const post = posts.find(p => p.id === postId);

        // Like button
        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;

            likeBtn.classList.toggle('liked');
            likeBtn.querySelector('span:first-child').textContent = post.liked ? '❤️' : '🤍';
            likeBtn.querySelector('.like-count').textContent = post.likes;
        });

        // Comment button
        const commentBtn = card.querySelector('.comment-btn');
        const commentsSection = card.querySelector('.comments-section');
        commentBtn.addEventListener('click', () => {
            commentsSection.classList.toggle('active');
        });

        // Comment input
        const commentInput = card.querySelector('.comment-input');
        const commentSubmit = card.querySelector('.comment-submit');

        commentInput.addEventListener('input', () => {
            commentSubmit.disabled = commentInput.value.trim() === '';
        });

        commentSubmit.addEventListener('click', () => {
            const text = commentInput.value.trim();
            if (!text) return;

            const newComment = {
                id: `comment-${Date.now()}`,
                user: currentUser,
                text: text,
                timestamp: Date.now()
            };

            post.comments.push(newComment);

            const commentsList = card.querySelector('.comments-list');
            commentsList.insertAdjacentHTML('afterbegin', createCommentHTML(newComment));

            commentInput.value = '';
            commentSubmit.disabled = true;

            const commentCount = card.querySelector('.comment-count');
            commentCount.textContent = post.comments.length;
        });

        // Share button
        const shareBtn = card.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => {
            alert('Share functionality would be implemented here!');
        });
    });

    // Update profile button
    updateProfileButton();
}

// Initialize profile page
function initProfilePage() {
    loadUserData();

    // Update profile display
    updateProfileDisplay();

    // Edit profile button
    const editBtn = document.querySelector('.edit-profile-btn');
    const modal = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const saveBtn = document.querySelector('.btn-save');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openEditModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveProfile();
        });
    }

    // Close modal on outside click
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Generate user's posts
    generateUserPosts();

    // Update profile button in nav
    updateProfileButton();
}

// Update profile display
function updateProfileDisplay() {
    document.querySelector('.profile-cover').src = currentUser.coverImage;
    document.querySelector('.profile-avatar').src = currentUser.avatar;
    document.querySelector('.profile-name').textContent = currentUser.name;
    document.querySelector('.profile-handle').textContent = currentUser.handle;
    document.querySelector('.profile-bio').textContent = currentUser.bio;

    const stats = document.querySelectorAll('.stat-number');
    stats[0].textContent = currentUser.posts;
    stats[1].textContent = currentUser.followers;
    stats[2].textContent = currentUser.following;
}

// Open edit modal
function openEditModal() {
    const modal = document.querySelector('.modal-overlay');
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-bio').value = currentUser.bio;
    document.getElementById('edit-avatar').value = currentUser.avatar;
    document.getElementById('edit-cover').value = currentUser.coverImage;
    modal.classList.add('active');
}

// Save profile
function saveProfile() {
    currentUser.name = document.getElementById('edit-name').value;
    currentUser.bio = document.getElementById('edit-bio').value;
    currentUser.avatar = document.getElementById('edit-avatar').value;
    currentUser.coverImage = document.getElementById('edit-cover').value;

    saveUserData();
    updateProfileDisplay();
    updateProfileButton();

    document.querySelector('.modal-overlay').classList.remove('active');
}

// Update profile button in navigation
function updateProfileButton() {
    const profileAvatar = document.querySelector('.profile-avatar-small');
    const profileName = document.querySelector('.profile-btn span');

    if (profileAvatar) {
        profileAvatar.src = currentUser.avatar;
    }
    if (profileName) {
        profileName.textContent = currentUser.name;
    }
}

// Generate user's posts
function generateUserPosts() {
    const userPostsContainer = document.querySelector('.user-posts');
    if (!userPostsContainer) return;

    const userPosts = [];
    const postCount = Math.floor(Math.random() * 5) + 3; // 3-7 posts
    currentUser.posts = postCount;

    for (let i = 0; i < postCount; i++) {
        const content = MOCK_POST_CONTENT[Math.floor(Math.random() * MOCK_POST_CONTENT.length)];
        const timestamp = Date.now() - (Math.random() * 86400000 * 7);

        userPosts.push({
            id: `user-post-${i}`,
            user: currentUser,
            content: content,
            timestamp: timestamp,
            likes: Math.floor(Math.random() * 100),
            liked: false,
            comments: []
        });
    }

    userPosts.sort((a, b) => b.timestamp - a.timestamp);
    userPostsContainer.innerHTML = userPosts.map(post => createPostCard(post)).join('');

    // Add event listeners to user posts
    document.querySelectorAll('.user-posts .post-card').forEach(card => {
        const postId = card.dataset.postId;
        const post = userPosts.find(p => p.id === postId);

        const likeBtn = card.querySelector('.like-btn');
        likeBtn.addEventListener('click', () => {
            post.liked = !post.liked;
            post.likes += post.liked ? 1 : -1;

            likeBtn.classList.toggle('liked');
            likeBtn.querySelector('span:first-child').textContent = post.liked ? '❤️' : '🤍';
            likeBtn.querySelector('.like-count').textContent = post.likes;
        });
    });
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const isFeedPage = document.querySelector('.feed-column') !== null;
    const isProfilePage = document.querySelector('.profile-container') !== null;

    if (isFeedPage) {
        initFeedPage();
        initFollowButtons();
    } else if (isProfilePage) {
        initProfilePage();
    }
});

// Initialize follow buttons
function initFollowButtons() {
    const followBtns = document.querySelectorAll('.follow-btn');

    followBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const isFollowing = this.classList.contains('following');

            if (isFollowing) {
                this.classList.remove('following');
                this.textContent = 'Follow';
            } else {
                this.classList.add('following');
                this.textContent = 'Following';
            }
        });
    });
}
