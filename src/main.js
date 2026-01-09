// ==========================================
// 3D Viewer Platform - 主程式入口
// ==========================================

import { ROOM_META } from './config/roomMeta.js';
import { ROOM_MODELS } from './config/roomModels.js';
import { getUrlParam, getConfigByKey, initAppDOM, applyRoomMeta } from './modules/utils.js';
import { initViewer, loadModel } from './modules/viewer.js';
import { loadGallery } from './modules/gallery.js';
import { initMeasureTool } from './modules/measure.js';
import { setupModeButtons, setupMobileCollapse, setupToolbarCollapse } from './modules/ui.js'

// ==========================================
// 除錯模式開關
// ==========================================
// ✨ 正式版請改為 false
const DEBUG_MODE = false; //true; 

// 動態引入除錯工具
let setupCameraDebug = null;
if (DEBUG_MODE) {
  const debugModule = await import('./modules/cameraDebug.js');
  setupCameraDebug = debugModule.setupCameraDebug;
}


// ==========================================
// 主程式初始化
// ==========================================
async function init() {
  // 1. 取得房間 ID
  const roomId = getUrlParam('id', 'room1');
  console.log('當前房間 ID:', roomId);

  // 2. 載入配置
  const roomMeta = getConfigByKey(ROOM_META, roomId, 'room1');
  const modelConfig = getConfigByKey(ROOM_MODELS, roomId, 'room1');

  // 3. 初始化 DOM
  if (!initAppDOM()) {
    console.error('DOM 初始化失敗');
    return;
  }

  // 4. 應用房間資訊到 UI
  applyRoomMeta(roomMeta);

  // 5. 初始化 3D Viewer
  const viewer = initViewer(modelConfig);
  if (!viewer) {
    console.error('Viewer 初始化失敗');
    return;
  }

  // 6. 載入 3D 模型
  const success = await loadModel(viewer, modelConfig);
  if (!success) {
    console.error('模型載入失敗');
    return;
  }

  // 7. 載入照片庫
  loadGallery(viewer, modelConfig);

  // 8. 初始化量測工具
  initMeasureTool(viewer);

  // 9. 設定 UI 控制按鈕
  setupModeButtons(viewer, modelConfig.cameraInit);

  // 10. 設定工具列折疊功能
  setupToolbarCollapse();

  // 11. 設定手機版摺疊功能
  setupMobileCollapse();
  window.addEventListener('resize', setupMobileCollapse);

  // 12. 僅開發模式啟用除錯工具
  if (DEBUG_MODE && setupCameraDebug) {
    setupCameraDebug(viewer);
    console.log('🔧 除錯模式已啟用');
  }

  console.log(`✅ 應用程式初始化完成 ${DEBUG_MODE ? '(開發模式)' : '(正式版)'}`);
}

// 啟動應用程式
init().catch(err => {
  console.error('❌ 應用程式啟動失敗:', err);
});
