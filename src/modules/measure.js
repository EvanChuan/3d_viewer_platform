import * as THREE from 'three';
import { $id } from './utils.js';

// 量測狀態
const measureState = {
  points: [],
  markers: [],
  group: new THREE.Group()
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let groundPlane = null;

// 初始化量測工具
export function initMeasureTool(viewer) {
  setTimeout(() => {
    if (!viewer.threeScene) {
      console.warn('Three.js Scene 未準備好');
      return;
    }

    viewer.threeScene.add(measureState.group);
    
    // 建立隱形地板用於射線檢測
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -1.0;
    viewer.threeScene.add(groundPlane);

    // 監聽點擊事件
    window.addEventListener('pointerdown', (event) => handleMeasureClick(event, viewer));
    
    console.log('量測工具已初始化');
  }, 1000);
}

// 處理量測點擊
function handleMeasureClick(event, viewer) {
  const appState = window.appState;
  if (!appState || appState.mode !== 'measure') return;
  if (event.target.tagName !== 'CANVAS') return;

  const rect = viewer.renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, viewer.camera);
  const intersects = raycaster.intersectObject(groundPlane);

  if (intersects.length > 0) {
    addMeasurePoint(intersects[0].point);
  }
}

// 新增量測點
function addMeasurePoint(point) {
  const measureToast = $id('measure-output');
  
  if (measureState.points.length >= 2) {
    clearMeasurements();
  }

  measureState.points.push(point);

  // 建立紅色球體標記
  const geometry = new THREE.SphereGeometry(0.05, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(point);
  measureState.group.add(sphere);
  measureState.markers.push(sphere);

  if (measureState.points.length === 2) {
    const p1 = measureState.points[0];
    const p2 = measureState.points[1];
    
    // 繪製連線
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    measureState.group.add(line);
    measureState.markers.push(line);

    // 顯示距離
    const dist = p1.distanceTo(p2);
    if (measureToast) {
      measureToast.innerText = `距離: ${dist.toFixed(2)} 公尺`;
    }
  } else {
    if (measureToast) {
      measureToast.innerText = "請點擊第二點";
    }
  }
}

// 清除量測標記
export function clearMeasurements() {
  const measureToast = $id('measure-output');
  
  measureState.points = [];
  measureState.markers.forEach(obj => {
    measureState.group.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
  measureState.markers = [];
  
  if (measureToast) {
    measureToast.innerText = "請點擊第一點";
  }
}
