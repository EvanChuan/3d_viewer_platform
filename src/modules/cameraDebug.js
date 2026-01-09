import * as THREE from 'three';
import { $id } from './utils.js';

// 相機除錯工具
export function setupCameraDebug(viewer) {
  // 建立除錯面板 DOM
  const debugPanel = document.createElement('div');
  debugPanel.id = 'camera-debug';
  debugPanel.innerHTML = `
    <div style="margin-bottom: 8px; font-weight: bold;">--- 相機開發工具 ---</div>
    <div id="cam-pos">Position: [0, 0, 0]</div>
    <div id="cam-look">LookAt: [0, 0, 0]</div>
    <div style="color: #aaa; margin-top: 8px; font-size: 11px;">
      按下 <span style="color: #00ff00; font-weight: bold;">C</span> 複製到 Console
    </div>
    <div style="color: #aaa; margin-top: 5px; font-size: 11px;">
      按下 <span style="color: #ff9900; font-weight: bold;">X</span> 切換座標軸
    </div>
  `;
  
  // 插入到頁面
  const viewContainer = $id('view-container');
  if (viewContainer) {
    viewContainer.appendChild(debugPanel);
  } else {
    console.warn('找不到 #view-container，無法插入相機除錯面板');
    return;
  }

  const posEl = $id('cam-pos');
  const lookEl = $id('cam-look');

  // 每 100ms 更新一次顯示資訊
  const updateInterval = setInterval(() => {
    if (!viewer.camera) {
      console.warn('相機尚未初始化');
      return;
    }

    const pos = viewer.camera.position;
    
    // 透過 OrbitControls 的 target 獲取 LookAt 點
    const lookAt = viewer.controls 
      ? viewer.controls.target 
      : new THREE.Vector3(0, 0, -1)
          .applyQuaternion(viewer.camera.quaternion)
          .add(pos);

    if (posEl) {
      posEl.innerText = `Position: [${pos.x.toFixed(5)}, ${pos.y.toFixed(5)}, ${pos.z.toFixed(5)}]`;
    }
    
    if (lookEl) {
      lookEl.innerText = `LookAt: [${lookAt.x.toFixed(5)}, ${lookAt.y.toFixed(5)}, ${lookAt.z.toFixed(5)}]`;
    }
  }, 100);

  // 鍵盤事件處理
  const handleKeyPress = (e) => {
    // 按 'C' 複製相機座標
    if (e.key.toLowerCase() === 'c' && viewer.camera) {
      const pos = viewer.camera.position;
      const lookAt = viewer.controls 
        ? viewer.controls.target 
        : new THREE.Vector3(0, 0, -1)
            .applyQuaternion(viewer.camera.quaternion)
            .add(pos);
      
      const configString = `
// ✨ 複製以下內容到 roomModels.js 的 cameraInit
cameraInit: {
  up: [0, 1, 0],
  position: [${pos.x.toFixed(5)}, ${pos.y.toFixed(5)}, ${pos.z.toFixed(5)}],
  lookAt: [${lookAt.x.toFixed(5)}, ${lookAt.y.toFixed(5)}, ${lookAt.z.toFixed(5)}]
},
      `;
      
      console.log("%c📷 相機位置已擷取：", "color: #00ff00; font-weight: bold; font-size: 14px;");
      console.log(configString);
      
      // 複製到剪貼簿
      if (navigator.clipboard) {
        navigator.clipboard.writeText(configString.trim())
          .then(() => {
            alert("✅ 相機座標已複製到剪貼簿！\n請查看 Console (F12) 查看詳細資訊");
          })
          .catch(() => {
            alert("📋 相機座標已印出在 Console (F12)");
          });
      } else {
        alert("📋 相機座標已印出在 Console (F12)");
      }
    }
    
    // 按 'X' 切換座標軸顯示
    if (e.key.toLowerCase() === 'x') {
      toggleAxesHelper();
    }
  };

  window.addEventListener('keydown', handleKeyPress);

  console.log('✅ 相機除錯工具已啟動 (按 C 鍵輸出座標 / 按 X 鍵切換座標軸)');

  // 返回清理函數
  return () => {
    clearInterval(updateInterval);
    window.removeEventListener('keydown', handleKeyPress);
    if (debugPanel.parentNode) {
      debugPanel.parentNode.removeChild(debugPanel);
    }
  };
}

// ✨ 新增：座標軸輔助工具
let axesHelper = null;
let axesVisible = false;

export function toggleAxesHelper() {
  // 需要等待 viewer 初始化
  const viewer = window.viewer;
  if (!viewer || !viewer.threeScene) {
    console.warn('Viewer 尚未初始化，無法切換座標軸');
    return;
  }

  if (!axesHelper) {
    // 首次建立座標軸
    // 參數: 座標軸長度（公尺）
    axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.set(0, 0, 0);
    viewer.threeScene.add(axesHelper);
    axesVisible = true;
    console.log('✅ 座標軸已顯示 (紅=X, 綠=Y, 藍=Z)');
  } else {
    // 切換顯示/隱藏
    axesVisible = !axesVisible;
    axesHelper.visible = axesVisible;
    console.log(axesVisible ? '✅ 座標軸已顯示' : '⚫ 座標軸已隱藏');
  }
}

// ✨ 新增：設定座標軸尺寸
export function setAxesSize(size = 5) {
  const viewer = window.viewer;
  if (!viewer || !viewer.threeScene) {
    console.warn('Viewer 尚未初始化');
    return;
  }

  if (axesHelper) {
    viewer.threeScene.remove(axesHelper);
    axesHelper.dispose();
  }

  axesHelper = new THREE.AxesHelper(size);
  axesHelper.position.set(0, 0, 0);
  axesHelper.visible = axesVisible;
  viewer.threeScene.add(axesHelper);
  
  console.log(`✅ 座標軸尺寸已設定為: ${size} 公尺`);
}
