import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { $id } from './utils.js';

// 初始化 3D Viewer
export function initViewer(modelConfig) {
  const viewContainer = $id('view-container');
  if (!viewContainer) {
    console.error('找不到 #view-container');
    return null;
  }

  const cameraConfig = modelConfig.cameraInit;
  
  const viewer = new GaussianSplats3D.Viewer({
    rootElement: viewContainer,
    cameraUp: cameraConfig.up,
    initialCameraPosition: cameraConfig.position,
    initialCameraLookAt: cameraConfig.lookAt,
    selfDrivenMode: true,
    antialiased: true,
    splatSortDistanceMapPrecision: 16,
  });

  // ✨ 將 viewer 儲存到全域，供除錯工具使用
  window.viewer = viewer;

  return viewer;
}

// 載入 3D 模型
export async function loadModel(viewer, modelConfig) {
  try {
    await viewer.addSplatScenes([{
      path: modelConfig.path,
      showLoadingUI: true,
      position: modelConfig.position,
      rotation: modelConfig.rotation,
      scale: modelConfig.scale,
      splatAlphaRemovalThreshold: modelConfig.alphaThreshold,
    }]);
    
    viewer.start();
    console.log('3D 模型載入成功');
    return true;
  } catch (err) {
    console.error('3D 模型載入失敗:', err);
    return false;
  }
}

// 相機同步到指定視角
export function syncCameraToView(viewer, position, lookAt) {
  if (!viewer?.camera || !viewer?.controls) {
    console.warn('Viewer 或 Controls 未初始化');
    return;
  }

  viewer.camera.position.set(position[0], position[1], position[2]);
  viewer.controls.target.set(lookAt[0], lookAt[1], lookAt[2]);
  viewer.camera.updateProjectionMatrix();
  viewer.controls.update();

  console.log(`相機已同步至: ${position}`);
}

// 重置相機到初始位置
export function resetCamera(viewer, cameraConfig) {
  syncCameraToView(viewer, cameraConfig.position, cameraConfig.lookAt);
}
