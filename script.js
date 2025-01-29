document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const preview = document.getElementById('preview');
    const previewImage = document.getElementById('previewImage');
    const downloadButton = document.getElementById('downloadButton');
    const convertMore = document.getElementById('convertMore');
    const uploadArea = document.querySelector('.upload-area');

    // Maximum file size: 10MB in bytes
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Handle file input change
    fileInput.addEventListener('change', handleFiles);
    
    // Handle upload button click
    uploadButton.addEventListener('click', () => fileInput.click());
    
    // Handle convert more button click
    convertMore.addEventListener('click', () => {
        preview.hidden = true;
        uploadArea.style.display = 'flex';
        fileInput.value = '';
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropZone.classList.add('highlight');
    }

    function unhighlight(e) {
        dropZone.classList.remove('highlight');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ files: files });
    }

    function validateFile(file) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            showNotification('File size must be less than 10MB', 'error');
            return false;
        }

        // Check file type
        if (!file.type.match('image/(jpeg|jpg|jfif)')) {
            showNotification('Please upload a JFIF or JPEG image', 'error');
            return false;
        }

        return true;
    }

    function handleFiles(e) {
        const files = e.target?.files || e.files;
        if (files.length > 0) {
            const file = files[0];
            
            if (!validateFile(file)) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    previewImage.src = e.target.result;
                    preview.hidden = false;
                    uploadArea.style.display = 'none';
                    convertToPNG(img); // Auto-convert to PNG
                    showImageInfo(img.width, img.height, file.size);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    function showImageInfo(width, height, size) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'image-info';
        infoDiv.innerHTML = `
            <p>Resolution: ${width}x${height}px</p>
            <p>Size: ${(size / 1024 / 1024).toFixed(2)}MB</p>
        `;
        
        // Remove any existing info
        const existingInfo = preview.querySelector('.image-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        preview.insertBefore(infoDiv, downloadButton);
    }

    function convertToPNG(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        try {
            // Draw the image onto the canvas
            ctx.drawImage(img, 0, 0);
            
            // Convert canvas content to PNG
            previewImage.src = canvas.toDataURL('image/png');
            downloadButton.hidden = false;
            
            // Show success message
            showNotification('Conversion successful! Click Download PNG to save your image.', 'success');
        } catch (error) {
            showNotification('Error converting image. Please try again.', 'error');
        }
    }

    function downloadPNG() {
        const link = document.createElement('a');
        link.download = 'converted-image.png';
        link.href = previewImage.src;
        link.click();
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 4px;
            z-index: 1000;
            color: white;
            background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Handle download button click
    downloadButton.addEventListener('click', downloadPNG);
});

// Handle contact form submission
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    window.location.href = `mailto:admin@smallseotoolsatoz.com?subject=Contact from JFIF2PNG&body=${encodeURIComponent(e.target.querySelector('textarea').value)}`;
    showNotification('Opening email client...', 'success');
    e.target.reset();
});