import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

// 相機初始設定
const CAMERA_INIT = {
    // debug view
    // up: [0, 1, 0],
    // position: [-38.7337, 1.65543, 1.11575],
    // lookAt: [-0.76401, 4.7374, -0.90475]

    up: [0, 1, 0],
    position: [-0.1, 4.4, 3.85],
    lookAt: [-0.15, 4.15, 1.5]
};

// === 1. 初始化 Viewer ===
const viewer = new GaussianSplats3D.Viewer({
    'cameraUp': CAMERA_INIT.up,
    'initialCameraPosition': CAMERA_INIT.position,
    'initialCameraLookAt': CAMERA_INIT.lookAt,
    'selfDrivenMode': true,
    'antialiased': true,
    'splatSortDistanceMapPrecision': 16,
});

// 載入你的 Splat 檔案
// 注意：addSplatScenes 接受的是一個 Array
viewer.addSplatScenes([{
    'path': '/assets/room1.ksplat', // 請確認檔名是否正確
    'splatAlphaRemovalThreshold': 0,
    'showLoadingUI': true,
    'position': [0, 0, 0],
    'rotation': [0, 0, 0],
    'scale': [1, 1, 1],
}])
.then((splatScenes) => { // 注意：這裡會回傳載入的場景物件
    viewer.start();
    console.log("Viewer started successfully");

    // === 強制修正可見度與大小 ===
    // 雖然你在參數設了 scale: 1，但有時 library 內部會覆蓋，我們這裡強制改回來
    const splatObject = viewer.threeScene.children[0];
    if (splatObject) {
        splatObject.visible = true;
        splatObject.scale.set(1, 1, 1);
        console.log("已強制設定模型為可見");
    }
})
.catch((err) => {
    console.error("載入失敗:", err);
});

// === 2. 狀態管理 ===
let appState = {
    mode: 'view', // 'view' or 'measure'
    measurePoints: [],
    measureMarkers: []
};

// === 3. UI 事件綁定 ===
const btnView = document.getElementById('btn-view');
const btnMeasure = document.getElementById('btn-measure');
const btnDayNight = document.getElementById('btn-daynight');
const measureToast = document.getElementById('measure-output');

function setMode(mode) {
    appState.mode = mode;
    // 更新 UI 樣式
    if (mode === 'view') {
        btnView.classList.add('active');
        btnMeasure.classList.remove('active');
        measureToast.classList.add('hidden');
        clearMeasurements();
    } else {
        btnView.classList.remove('active');
        btnMeasure.classList.add('active');
        measureToast.classList.remove('hidden');
        measureToast.innerText = "請點擊第一點";
    }
}

// 綁定按鈕
if (btnView) btnView.addEventListener('click', () => setMode('view'));
if (btnMeasure) btnMeasure.addEventListener('click', () => setMode('measure'));
if (btnDayNight) btnDayNight.addEventListener('click', () => {
    alert("日夜切換功能開發中");
});

// === 4. 量測功能實作 ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const measureGroup = new THREE.Group();

// 等待 Viewer 初始化後加入自定義邏輯
setTimeout(() => {
    // 檢查 threeScene 是否存在
    if (!viewer.threeScene) {
        console.warn("Viewer scene not ready yet");
        return;
    }

    viewer.threeScene.add(measureGroup);

    // 建立隱形地板 (Plane)
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false }); // 設為 true 可以 debug 地板位置
    const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -1.0; // 根據模型調整高度
    viewer.threeScene.add(groundPlane);

    // 監聽點擊事件
    window.addEventListener('pointerdown', (event) => {
        if (appState.mode !== 'measure') return;
        if (event.target.tagName !== 'CANVAS') return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, viewer.camera);
        
        // 嘗試碰撞隱形地板
        const intersects = raycaster.intersectObject(groundPlane);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            addMeasurePoint(point);
        }
    });
}, 2000); // 延長到 2秒 確保場景載入

function addMeasurePoint(point) {
    if (appState.measurePoints.length >= 2) {
        clearMeasurements();
    }

    appState.measurePoints.push(point);

    // 1. 加紅點
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    measureGroup.add(sphere);
    appState.measureMarkers.push(sphere);

    // 2. 兩點畫線
    if (appState.measurePoints.length === 2) {
        const p1 = appState.measurePoints[0];
        const p2 = appState.measurePoints[1];

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        measureGroup.add(line);
        appState.measureMarkers.push(line);

        const distance = p1.distanceTo(p2);
        measureToast.innerText = `距離: ${distance.toFixed(2)} 公尺`;
    } else {
        measureToast.innerText = "請點擊第二點";
    }
}

function clearMeasurements() {
    appState.measurePoints = [];
    appState.measureMarkers.forEach(obj => {
        measureGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    appState.measureMarkers = [];
    measureToast.innerText = "請點擊第一點";
}
