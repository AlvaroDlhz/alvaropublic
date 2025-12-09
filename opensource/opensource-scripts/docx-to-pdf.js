// DOCX to PDF Converter - JavaScript
// Complete user experience flow

document.addEventListener('DOMContentLoaded', () => {
    initConverter();
});

// Global variables
let selectedFile = null;

// Initialize converter
function initConverter() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const convertBtn = document.getElementById('convertBtn');
    const convertAnotherBtn = document.getElementById('convertAnotherBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Browse button click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });

    // Remove file button
    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetConverter();
    });

    // Convert button
    convertBtn.addEventListener('click', () => {
        if (selectedFile) {
            convertFile();
        }
    });

    // Convert another button
    convertAnotherBtn.addEventListener('click', () => {
        resetConverter();
    });

    // Download button
    downloadBtn.addEventListener('click', () => {
        downloadPDF();
    });

    // Initialize scroll animations
    initScrollAnimations();
}

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
        showError('Please select a valid DOCX file');
        return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showError('File size exceeds 10MB limit');
        return;
    }

    selectedFile = file;

    // Update UI
    document.getElementById('uploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);

    // Show success notification
    showNotification(`File "${file.name}" loaded successfully!`, 'success');
}

// Convert file
function convertFile() {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const convertBtn = document.getElementById('convertBtn');

    // Hide convert button and show progress
    convertBtn.style.display = 'none';
    progressContainer.style.display = 'block';

    // Get conversion options
    const preserveFormatting = document.getElementById('preserveFormatting').checked;
    const embedFonts = document.getElementById('embedFonts').checked;
    const compressPDF = document.getElementById('compressPDF').checked;

    // Simulate conversion progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        progressFill.style.width = progress + '%';
        progressText.textContent = `Converting... ${Math.round(progress)}%`;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                showDownloadArea();
            }, 500);
        }
    }, 200);

    // Log conversion options (for demonstration)
    console.log('Conversion options:', {
        preserveFormatting,
        embedFonts,
        compressPDF
    });
}

// Show download area
function showDownloadArea() {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('downloadArea').style.display = 'block';

    showNotification('Conversion completed successfully!', 'success');
}

// Download PDF
function downloadPDF() {
    if (!selectedFile) return;

    // In a real implementation, this would download the converted PDF
    // For now, we'll simulate the download

    showNotification('Download started! (Demo mode)', 'info');

    // Simulate download with a blob
    const pdfName = selectedFile.name.replace('.docx', '.pdf');

    // Create a dummy PDF blob for demonstration
    const blob = new Blob(['This is a demo PDF file'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = pdfName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Note: In production, you would integrate with a library like:
    // - docx-pdf (Node.js)
    // - pdf-lib (client-side PDF generation)
    // - Or a backend API for conversion
}

// Reset converter
function resetConverter() {
    selectedFile = null;

    // Reset UI
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('downloadArea').style.display = 'none';
    document.getElementById('convertBtn').style.display = 'flex';

    // Reset file input
    document.getElementById('fileInput').value = '';

    // Reset progress
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = 'Converting... 0%';

    // Reset checkboxes to default
    document.getElementById('preserveFormatting').checked = true;
    document.getElementById('embedFonts').checked = true;
    document.getElementById('compressPDF').checked = false;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existing = document.querySelector('.converter-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'converter-notification';
    notification.textContent = message;

    // Set color based on type
    let bgColor = '#111111';
    let borderColor = 'rgba(255, 255, 255, 0.1)';

    if (type === 'success') {
        borderColor = 'rgba(0, 255, 136, 0.3)';
    } else if (type === 'error') {
        borderColor = 'rgba(255, 68, 68, 0.3)';
    }

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: bgColor,
        color: '#f5f5f5',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: '10000',
        fontSize: '0.9rem',
        fontWeight: '500',
        fontFamily: "'Inter', sans-serif",
        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1), slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) 2.6s',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)'
    });

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show error
function showError(message) {
    showNotification(message, 'error');

    // Also show inline error if needed
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const uploadArea = document.getElementById('uploadArea');
    const existingError = uploadArea.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    uploadArea.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe feature cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Prevent default drag and drop on the whole page
window.addEventListener('dragover', (e) => {
    e.preventDefault();
}, false);

window.addEventListener('drop', (e) => {
    e.preventDefault();
}, false);
