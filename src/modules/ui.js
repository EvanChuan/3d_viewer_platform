import { $id } from './utils.js';
import { resetCamera } from './viewer.js';
import { clearMeasurements } from './measure.js';

// UI 模式管理
export function setupModeButtons(viewer, cameraConfig) {
  const btnView = $id('btn-view');
  const btnMeasure = $id('btn-measure');
  const btnHome = $id('btn-home');
  const measureToast = $id('measure-output');

  // 初始化全域狀態
  window.appState = { mode: 'view' };

  function setMode(mode) {
    window.appState.mode = mode;
    
    if (mode === 'view') {
      if (btnView) btnView.classList.add('active');
      if (btnMeasure) btnMeasure.classList.remove('active');
      if (measureToast) measureToast.classList.add('hidden');
      clearMeasurements();
    } else if (mode === 'measure') {
      if (btnView) btnView.classList.remove('active');
      if (btnMeasure) btnMeasure.classList.add('active');
      if (measureToast) {
        measureToast.classList.remove('hidden');
        measureToast.innerText = "請點擊第一點";
      }
    }
  }

  if (btnView) btnView.addEventListener('click', () => setMode('view'));
  if (btnMeasure) btnMeasure.addEventListener('click', () => setMode('measure'));
  if (btnHome) {
    btnHome.addEventListener('click', () => {
      setMode('view');
      resetCamera(viewer, cameraConfig);
      console.log('已重置相機到初始位置');
    });
  }

  // 預設瀏覽模式
  setMode('view');
}

// ✨ 新增：工具列折疊功能
export function setupToolbarCollapse() {
  const toolbar = document.querySelector('.toolbar');
  if (!toolbar) {
    console.warn('找不到 .toolbar 元素');
    return;
  }

  // 建立折疊按鈕
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toolbar-toggle';
  toggleBtn.innerHTML = '◀'; // 預設顯示「收起」箭頭
  toggleBtn.title = '收起選單';
  
  // 插入到工具列最上方
  toolbar.insertBefore(toggleBtn, toolbar.firstChild);

  let isCollapsed = false;

  toggleBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    
    if (isCollapsed) {
      toolbar.classList.add('collapsed');
      toggleBtn.innerHTML = '▶';
      toggleBtn.title = '展開選單';
    } else {
      toolbar.classList.remove('collapsed');
      toggleBtn.innerHTML = '◀';
      toggleBtn.title = '收起選單';
    }
  });

  console.log('工具列折疊功能已啟用');
}

// 手機版資訊卡摺疊功能
export function setupMobileCollapse() {
  const propertyCard = document.querySelector('.property-card');
  if (!propertyCard) return;

  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '▼';
    toggleBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      z-index: 101;
      font-size: 14px;
    `;
    
    propertyCard.appendChild(toggleBtn);
    
    let isCollapsed = false;
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isCollapsed = !isCollapsed;
      
      if (isCollapsed) {
        propertyCard.style.maxHeight = '60px';
        propertyCard.style.overflow = 'hidden';
        toggleBtn.innerHTML = '▶';
      } else {
        propertyCard.style.maxHeight = '45vh';
        propertyCard.style.overflow = 'auto';
        toggleBtn.innerHTML = '▼';
      }
    });
  }
}
