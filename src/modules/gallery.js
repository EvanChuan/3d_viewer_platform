import { $id } from './utils.js';
import { syncCameraToView } from './viewer.js';

// 載入照片庫
export function loadGallery(viewer, modelConfig) {
  const galleryContainer = $id('gallery-container');
  const overlay = $id('photo-overlay');
  const enlargedImg = $id('enlarged-photo');
  const photoCaption = $id('photo-info');

  if (!galleryContainer) {
    console.error('找不到照片庫容器');
    return;
  }

  if (!modelConfig.images || modelConfig.images.length === 0) {
    galleryContainer.innerHTML = `<p style="color:gray; padding:10px;">暫無現場照片</p>`;
    return;
  }

  galleryContainer.innerHTML = '';

  // 新增：導覽標題
  const galleryTitle = document.createElement('div');
  galleryTitle.className = 'gallery-title';
  galleryTitle.innerHTML = '照片導覽 <span>(點擊看詳情)</span>';
  galleryContainer.appendChild(galleryTitle);

  // 新增：圖片容器
  const imagesWrapper = document.createElement('div');
  imagesWrapper.className = 'gallery-images';
  galleryContainer.appendChild(imagesWrapper);

  modelConfig.images.forEach((imgData) => {
    const img = document.createElement('img');
    const fileName = (typeof imgData === 'string') ? imgData : imgData.file;
    img.src = `${modelConfig.imagepath}${fileName}`;
    
    img.style.cssText = `
      height: 90%;
      cursor: pointer;
      border: 2px solid #8b7f7fff;
      border-radius: 6px;
      object-fit: cover;
      transition: all 0.2s;
    `;

    // ✅ 修正：直接在閉包內處理點擊邏輯
    img.onclick = () => {
      // 1. 高亮選中圖片
      Array.from(imagesWrapper.children).forEach(i => i.style.borderColor = '#8b7f7fff');
      img.style.borderColor = '#00ff00';

      // 2. 同步相機 (如果有座標資訊)
      if (typeof imgData === 'object' && imgData.position) {
        syncCameraToView(viewer, imgData.position, imgData.lookAt);
        
        if (photoCaption) {
          photoCaption.innerHTML = imgData.info || "";
          photoCaption.style.display = imgData.info ? 'block' : 'none';
        }
      } else {
        if (photoCaption) {
          photoCaption.innerHTML = "";
          photoCaption.style.display = 'none';
        }
      }

      // 3. 顯示放大彈窗
      if (overlay && enlargedImg) {
        enlargedImg.src = img.src;
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
      }
    };

    imagesWrapper.appendChild(img);
  });

  setupPhotoOverlay(overlay);
}

// 設定照片彈窗關閉功能
function setupPhotoOverlay(overlay) {
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('close-btn')) {
      overlay.classList.add('hidden');
      overlay.style.display = 'none';
    }
  });
}
