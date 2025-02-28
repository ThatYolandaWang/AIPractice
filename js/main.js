// 获取 DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');
const compressionSettings = document.querySelector('.compression-settings');
const previewSection = document.querySelector('.preview-section');

// 当前处理的图片文件
let currentFile = null;

// 文件拖拽处理
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageUpload(files[0]);
    }
});

// 文件输入处理
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
    }
});

// 质量滑块处理
qualitySlider.addEventListener('input', (e) => {
    const value = e.target.value;
    qualityValue.textContent = `${value}%`;
    if (currentFile) {
        compressImage(currentFile, value / 100);
    }
});

// 下载按钮处理
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedPreview.src;
    link.click();
});

// 处理图片上传
async function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    currentFile = file;
    
    // 显示原始图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
    };
    reader.readAsDataURL(file);

    // 显示压缩设置和预览区域
    compressionSettings.style.display = 'block';
    previewSection.style.display = 'block';

    // 使用当前质量值压缩图片
    await compressImage(file, qualitySlider.value / 100);
}

// 压缩图片
async function compressImage(file, quality) {
    try {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            quality: quality
        };

        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            compressedPreview.src = e.target.result;
            compressedSize.textContent = formatFileSize(compressedFile.size);
        };
        
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加页面加载完成的动画效果
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
}); 