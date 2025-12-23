import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

const ROOM_META = {
  room1: {
    title: '台北信義區・陽光景觀套房',
    address: '台北市信義區信義路五段',
    price: '$21,000 / 月',
    size: '12 坪',
    layout: '1 房 1 廳',
    floor: '3F/5F',
    desc: '這是一個使用 iPhone 拍攝並透過 3DGS 重建的真實房源。配備全新家具，採光極佳。',
    agent_name: 'Evan',
    agent_role: '房東直租',
  },
  room2: {
    title: '中山區・溫馨雙人套房',
    address: '台北市中山區民生東路二段',
    price: '$32,000 / 月',
    size: '15 坪',
    layout: '2 房 1 廳',
    floor: '8F/12F',
    desc: '鄰近捷運與公園，採光通風良好，適合小家庭入住。',
  },
  room3: {
    title: '大安區・靜巷質感宅',
    address: '台北市大安區信義路三段',
    price: '$40,000 / 月',
    size: '18 坪',
    layout: '2 房 2 廳',
    floor: '5F/7F',
    desc: '靜巷低噪音，精緻裝潢，附全套家具家電。',
  },
};


// ==========================================
// 初始化 DOM 結構 (必須最先執行)
const app = document.querySelector('#app');
app.innerHTML = `
  <div id="view-container" style="position: relative; width: 100%; height: 85vh;"></div>
  <div id="gallery-container" style="width: 100%; height: 15vh; background: #222; display: flex; overflow-x: auto; align-items: center; padding: 10px; box-sizing: border-box;"></div>
  <div id="measure-output" class="hidden" style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 4px; pointer-events: none;">請點擊第一點</div>
`;
const viewContainer = document.querySelector('#view-container');
const galleryContainer = document.querySelector('#gallery-container');
const measureToast = document.getElementById('measure-output');


// Helper: 將歐拉角 (度數) 轉為四元數陣列
function getRotationQuat(xDeg, yDeg, zDeg) {
    const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg),
        'XYZ'
    );
    const q = new THREE.Quaternion().setFromEuler(euler);
    return [q.x, q.y, q.z, q.w];
}

// 讀 URL ?room=room1/room2/room3
const params = new URLSearchParams(window.location.search);
const roomId = params.get('room') || 'room1';
const meta = ROOM_META[roomId] || ROOM_META.room1;

// 針對不同房間的設定
const ROOM_CONFIGS = {
  room1: {
    path: 'assets/room1.ksplat',
    transformsPath: 'data/room1/transforms.json',
    imagepath: 'data/room1',
    scale: [1.5, 1.5, 1.5],
    position: [0, 5, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
  room2: {
    path: 'assets/room2.splat',
    transformsPath: 'data/room2/transforms.json',
    imagepath: 'data/room2',
    scale: [1.5, 1.5, 1.5],
    position: [0, 5, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
  room3: {
    path: 'assets/room3.splat',
    transformsPath: 'data/room3/transforms.json',
    imagepath: 'data/room3',
    scale: [1.5, 1.5, 1.5],
    position: [0, 5, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
};
const MODEL_CONFIG = ROOM_CONFIGS[roomId];


// 相機初始設定
const CAMERA_INIT = {
    // debug view
    up: [0, 1, 0],
    position: [-38.7337, 1.65543, 1.11575],
    lookAt: [-0.76401, 4.7374, -0.90475]

    // up: [0, 1, 0],
    // position: [-0.1, 4.4, 3.85],
    // lookAt: [-0.15, 4.15, 1.5]
}

// 初始化 Viewer
const viewer = new GaussianSplats3D.Viewer({
    'rootElement': viewContainer,
    'cameraUp': CAMERA_INIT.up,
    'initialCameraPosition': CAMERA_INIT.position,
    'initialCameraLookAt': CAMERA_INIT.lookAt,
    'selfDrivenMode': true,
    'antialiased': true,
    'splatSortDistanceMapPrecision': 16,
});

// 載入 Splat 檔案
viewer.addSplatScenes([{
    'path': MODEL_CONFIG.path,
    'showLoadingUI': true,
    'position':  MODEL_CONFIG.position,
    'rotation': MODEL_CONFIG.rotation,
    'scale': MODEL_CONFIG.scale,
    'splatAlphaRemovalThreshold': MODEL_CONFIG.alphaThreshold,
}])
.then(() => {
  console.log('Viewer started successfully');
  viewer.start();

}).catch((err) => {
  console.error('載入失敗:', err);
});


// ==========================================
// 狀態管理與 UI
let appState = {
    mode: 'view',
    measurePoints: [],
    measureMarkers: []
};

// 為了讓外部按鈕也能運作 (如果你有另外的 HTML 按鈕)
// 這裡假設按鈕可能不存在於 app.innerHTML 裡，做個防呆
const btnView = document.getElementById('btn-view');
const btnMeasure = document.getElementById('btn-measure');

function setMode(mode) {
    appState.mode = mode;
    if (mode === 'view') {
        if(btnView) btnView.classList.add('active');
        if(btnMeasure) btnMeasure.classList.remove('active');
        measureToast.classList.add('hidden');
        clearMeasurements();
    } else {
        if(btnView) btnView.classList.remove('active');
        if(btnMeasure) btnMeasure.classList.add('active');
        measureToast.classList.remove('hidden');
        measureToast.innerText = "請點擊第一點";
    }
}

if (btnView) btnView.addEventListener('click', () => setMode('view'));
if (btnMeasure) btnMeasure.addEventListener('click', () => setMode('measure'));

const axesHelper = new THREE.AxesHelper(5);
axesHelper.position.set(0, 0, 0);
viewer.threeScene.add(axesHelper);


// ==========================================
// 下方照片列與同步功能
// 讀取 NeRFStudio 匯出的 transforms.json，產生底部照片列
async function loadGallery() {
  try {
    // 依 roomId 載入對應房間的 transforms.json
    const response = await fetch(MODEL_CONFIG.transformsPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const frames = data.frames.sort(
      (a, b) => a.file_path.localeCompare(b.file_path)
    );

    frames.forEach((frame) => {
        const img = document.createElement('img');
        img.src = `${MODEL_CONFIG.imagepath}${frame.file_path}`;
        img.style.cssText = `
            height: 100%;
            margin-right: 10px;
            cursor: pointer;
            border: 2px solid transparent;
            border-radius: 4px;
            object-fit: cover;
        `;

        img.onclick = () => {
            // UI：高亮目前選到的縮圖
            Array.from(galleryContainer.children).forEach((el) => {
            el.style.border = '2px solid transparent';
            });
            img.style.border = '2px solid #00ff00';

            // 相機同步到這張照片對應的 transform_matrix
            syncCamera(frame.transform_matrix);
        };

        galleryContainer.appendChild(img);
    });
  } catch (err) {
    console.error('無法載入 transforms.json:', err);
    galleryContainer.innerHTML =
      `<p style="color:white; padding:10px;">無法載入相機資料 (${err.message})</p>`;
  }
}

// 將 Nerfstudio 的 4x4 transform_matrix 轉成 Three.js 的 camera pose
function syncCamera(matrixArray) {
  // 1. 位置（translation）
  let x = matrixArray[0][3];
  let y = matrixArray[1][3];
  let z = matrixArray[2][3];

  // Nerfstudio / OpenCV → Three.js 座標系修正
  // OpenCV: +Z forward, +Y down
  // Three.js: -Z forward, +Y up
  y = -y;
  z = -z;

  // 2. 取出第三欄當作 forward vector
  let fx = matrixArray[0][2];
  let fy = matrixArray[1][2];
  let fz = matrixArray[2][2];

  // 同樣做 Y/Z 翻轉
  fy = -fy;
  fz = -fz;

  // 讓鏡頭往前看一小段距離
  const targetX = x + fx * 2.0;
  const targetY = y + fy * 2.0;
  const targetZ = z + fz * 2.0;

  console.log(`移動相機至: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);

  if (viewer.camera) {
    viewer.camera.position.set(x, y, z);
    viewer.camera.lookAt(targetX, targetY, targetZ);
    viewer.camera.up.set(CAMERA_INIT.up[0], CAMERA_INIT.up[1], CAMERA_INIT.up[2]);
    viewer.camera.updateProjectionMatrix();

    // 如果 Viewer 有 OrbitControls，就同步更新 target
    if (viewer.controls) {
      viewer.controls.target.set(targetX, targetY, targetZ);
      viewer.controls.update();
    }
  }
}


// ==========================================
// 量測工具 (維持原樣，但修正變數引用)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const measureGroup = new THREE.Group();

setTimeout(() => {
    if (!viewer.threeScene) return;
    
    viewer.threeScene.add(measureGroup);
    
    // 隱形地板
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -1.0; 
    viewer.threeScene.add(groundPlane);

    window.addEventListener('pointerdown', (event) => {
        if (appState.mode !== 'measure') return;
        if (event.target.tagName !== 'CANVAS') return; // 確保只在 Canvas 上觸發

        // 修正 E: 使用 viewer.renderer.domElement 來計算座標更準確
        const rect = viewer.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, viewer.camera);
        const intersects = raycaster.intersectObject(groundPlane);

        if (intersects.length > 0) {
            addMeasurePoint(intersects[0].point);
        }
    });
}, 1000);

function addMeasurePoint(point) {
    if (appState.measurePoints.length >= 2) clearMeasurements();
    appState.measurePoints.push(point);

    const geometry = new THREE.SphereGeometry(0.05, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    measureGroup.add(sphere);
    appState.measureMarkers.push(sphere);

    if (appState.measurePoints.length === 2) {
        const p1 = appState.measurePoints[0];
        const p2 = appState.measurePoints[1];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        measureGroup.add(line);
        appState.measureMarkers.push(line);
        
        const dist = p1.distanceTo(p2);
        measureToast.innerText = `距離: ${dist.toFixed(2)} 公尺`;
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


function applyRoomMeta(meta) {
    const $ = (id) => document.getElementById(id);

    $('listing-title').innerText  = meta.title;
    $('listing-address').innerText = meta.address;
    $('listing-price').innerText  = meta.price;
    $('listing-size').innerText   = meta.size;
    $('listing-layout').innerText = meta.layout;
    $('listing-floor').innerText  = meta.floor;
    $('listing-desc').innerText   = meta.desc;
    if ($('agent_name')) $('agent_name').innerText = meta.agentName;
    if ($('agent_role')) $('agent_role').innerText = meta.agentRole;
}

// 在 main.js 最前面建立 app.innerHTML 之後呼叫
applyRoomMeta(meta);

// 啟動照片列（保持在檔案最後）
loadGallery();
