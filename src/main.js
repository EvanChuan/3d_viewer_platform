import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

// Gobal setting
// 相機初始設定
const CAMERA_INIT = {
    up: [0, 1, 0],
    position: [-2.44040, 0.31066, 0.19306],
    lookAt: [1.33026, -0.28629, -1.54476]
}

// 房間資訊
const ROOM_META = {
  room1: {
    title: '仁德區・陽光景觀雙人套房',
    address: '台南市仁德區',
    price: '$11,000 / 月',
    size: '10坪',
    layout: '1房 1衛',
    floor: '3F/4F',
    desc: '雙人套房、落地窗陽台、乾溼分離衛浴、全新家具與電器設備。',
    agent_name: 'Evan',
    agent_role: '房東直租',
  },
  room2: {
    title: '仁德區・陽光景觀單人套房',
    address: '台南市仁德區',
    price: '$8,500 / 月',
    size: '7 坪',
    layout: '1房 1衛',
    floor: '3F/4F',
    desc: '單人套房、落地窗陽台、乾溼分離衛浴、全新家具與電器設備。',
    agent_name: 'Evan',
    agent_role: '房東直租',
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

// 初始化 DOM 結構
const app = document.querySelector('#app');
app.innerHTML = `
  <div id="view-container"></div>
  <div id="gallery-container"></div>
  <div id="measure-output" class="hidden">請點擊第一點</div>
  <div id="info-overlay" class="hidden">
    <div id="info-content">這裡顯示照片描述...</div>
  </div>
`
  // <div id="camera-debug">
  //   <div>--- 相機開發工具 ---</div>
  //   <div id="cam-pos">Position: [0, 0, 0]</div>
  //   <div id="cam-look">LookAt: [0, 0, 0]</div>
  //   <div style="color: #aaa; margin-top: 5px;">按下 <span>C</span> 複製到 Console</div>
  // </div>
;

// 後續的 DOM 節點選取邏輯保持不變
const viewContainer = document.querySelector('#view-container');
const galleryContainer = document.querySelector('#gallery-container');
const measureToast = document.getElementById('measure-output');
const infoOverlay = document.getElementById('info-overlay');
const infoContent = document.getElementById('info-content');

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
    imagepath: 'data/room1/images/',
    images: [
      {
        file: '0015.jpg',
        position: [1.14248, -0.03280, 0.01065],
        lookAt: [2.52598, -0.14465, -0.23770],
        info: '<b>落地窗與陽台</b><br>大片落地窗設計，早上時段採光極佳，通風良好。陽台空間可再做利用。'
      },
      {
        file: '0108.jpg',
        position: [-1.70076, 0.49715, 0.85888],
        lookAt: [1.64495, -0.38176, -3.86160],
        info: '<b>書桌、衣櫃</b><br>多功能書桌電腦桌以及電腦椅。多層拉門式衣櫃。'
      },
      {
        file: '0121.jpg',
        position: [-2.04205, -1.09295, -0.77017],
        lookAt: [-0.35111, -1.62745, 1.11226],
        info: '<b>冰箱</b><br>雙門省電電冰箱。'
      },
      {
        file: '0394.jpg',
        position: [-1.05265, 0.12635, 3.04182],
        lookAt: [0.38808, -0.16050, 3.11903],
        info: '<b>衛浴</b><br>乾溼分離衛浴，洗完澡後地板不溼滑。'
      },
      {
        file: '0408.jpg',
        position: [3.18279, -0.31035, 0.16772],
        lookAt: [1.88239, -0.62819, -0.76218],
        info: '<b>標準雙人床</b><br>獨立筒全新雙人床。提供保潔墊，床單可自行套上。'
      }
    ],
    cameraInit: {
      up: [0, 1, 0],
      position: [-2.44040, 0.31066, 0.19306],
      lookAt: [1.33026, -0.28629, -1.54476]
    },
    scale: [1.0, 1.0, 1.0],
    position: [0, 0, 0],
    rotation: getRotationQuat(180, 60, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
  room2: {
    path: 'assets/room2.splat',
    imagepath: 'data/room2/images/',
    images: [      
      {
        file: '0010.jpg',
        position: [2.47568, 0.58055, 6.71965],
        lookAt: [1.64006, -0.29540, -0.08876],
        info: '<b>落地窗與陽台</b><br>大片落地窗設計，下午時段採光極佳，通風良好。陽台空間可再做利用。'
      },
      {
        file: '0091.jpg',
        position: [0.59860, 0.36402, 6.34861],
        lookAt: [2.19979, 0.04867, 4.26838],
        info: '<b>書桌,衣櫃</b><br>全新書桌以及衣櫃，多功能多隔間。'
      },
      {
        file: '0137.jpg',
        position: [-0.17408, 0.51737, -1.11695],
        lookAt: [0.19351, 0.26373, -0.62842],
        info: '<b>單人床</b><br>獨立筒單人床。提供保潔墊，床單可自行套上。'
      },
      {
        file: '0165.jpg',
        position: [4.15656, -0.63881, 4.70131],
        lookAt: [2.72083, -1.00054, 3.93672],
        info: '<b>冰箱</b><br>雙門省電電冰箱。'
      },
      {
        file: '0193.jpg',
        position: [-2.86285, -0.64242, -2.10635],
        lookAt: [0.86523, -0.94457, -1.51923],
        info: '<b>書桌,衣櫃</b><br>全新書桌以及衣櫃，多功能多隔間。'
      },
      {
        file: '0312.jpg',
        position: [-0.91573, 0.32600, -0.90864],
        lookAt: [-2.61255, -0.28620, -1.87381],
        info: '<b>衛浴</b><br>乾溼分離衛浴，洗完澡後地板不溼滑。'
      },
      {
        file: '0376.jpg',
        position: [-2.13576, -0.37465, -3.43187],
        lookAt: [-2.88232, -0.51778, -3.14454],
        info: '<b>衛浴</b><br>乾溼分離衛浴，洗完澡後地板不溼滑。'
      }
    ],
    cameraInit: {
      up: [0, 1, 0],
      position: [3.12415, 0.21492, 3.99105],
      lookAt: [0.18981, -0.79636, -0.23536]
    },
    scale: [1.0, 1.0, 1.0],
    position: [0, 0, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
  room3: {
    path: 'assets/room3.splat',
    imagepath: 'data/room3/images/', // 確保路徑指向圖片資料夾
    images: ['img_01.jpg', 'img_02.jpg', 'img_03.jpg', 'img_04.jpg', 'img_05.jpg'], // 手動列出想展示的照片
    scale: [1.0, 1.0, 1.0],
    position: [0, 0, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5, // 過濾雜訊閾值
  },
};
const MODEL_CONFIG = ROOM_CONFIGS[roomId];

// 初始化 Viewer
const currentCamera = MODEL_CONFIG.cameraInit || CAMERA_INIT;
const viewer = new GaussianSplats3D.Viewer({
    'rootElement': viewContainer,
    'cameraUp': currentCamera.up,
    'initialCameraPosition': currentCamera.position,
    'initialCameraLookAt': currentCamera.lookAt,
    'selfDrivenMode': true,
    'antialiased': true,
    'splatSortDistanceMapPrecision': 16,
});

// 載入模型檔案
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
  setupCameraDebug(); // 啟動監測工具

}).catch((err) => {
  console.error('載入失敗:', err);
});


// ==========================================
// 功能列狀態管理與 UI
let appState = {
    mode: 'view',
    measurePoints: [],
    measureMarkers: []
};

// 為了讓外部按鈕也能運作 (如果你有另外的 HTML 按鈕)
const btnView = document.getElementById('btn-view');
const btnMeasure = document.getElementById('btn-measure');
const btnHome = document.getElementById('btn-home'); 

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
if (btnHome) {
    btnHome.addEventListener('click', () => {
        // 1. 先切換回瀏覽模式，避免留在量測模式
        setMode('view');
        
        // 2. 執行相機重置
        const currentCamera = ROOM_CONFIGS[roomId].cameraInit || CAMERA_INIT;
        viewer.camera.position.set(...currentCamera.position);
        viewer.controls.target.set(...currentCamera.lookAt);
        viewer.controls.update();
        
        console.log("已回到初始位置並切換至瀏覽模式");
    });
}



// ==========================================
// 下方照片列與同步功能
function loadGallery() {
    if (!MODEL_CONFIG.images || MODEL_CONFIG.images.length === 0) {
        galleryContainer.innerHTML = `<p style="color:gray; padding:10px;">暫無現場照片</p>`;
        return;
    }

    galleryContainer.innerHTML = ''; // 清空舊內容

    // 獲取彈窗元件
    const overlay = document.getElementById('photo-overlay');
    const enlargedImg = document.getElementById('enlarged-photo');
    const photoCaption = document.getElementById('photo-info');

    MODEL_CONFIG.images.forEach((imgData) => {
        const img = document.createElement('img');
        
        // 兼容物件與純字串格式
        const fileName = (typeof imgData === 'string') ? imgData : imgData.file;
        img.src = `${MODEL_CONFIG.imagepath}${fileName}`;
        
        img.style.cssText = `
            height: 90%;
            cursor: pointer;
            border: 2px solid #333;
            border-radius: 6px;
            object-fit: cover;
            transition: all 0.2s;
        `;

        img.onclick = () => {
            // 1. UI 高亮處理
            Array.from(galleryContainer.children).forEach(i => i.style.borderColor = '#333');
            img.style.borderColor = '#00ff00';

            // 2. 執行相機同步 (僅當 imgData 是物件且有座標時)
            if (typeof imgData === 'object' && imgData.position) {
                syncCameraToView(imgData.position, imgData.lookAt);
                photoCaption.innerHTML = imgData.info || "";
            } else {
                photoCaption.innerHTML = "";
            }

            // 3. 顯示放大彈窗 (關鍵點！)
            if (overlay && enlargedImg) {
                enlargedImg.src = img.src; // 使用目前圖片的路徑
                overlay.classList.remove('hidden');
                overlay.style.display = 'flex'; // 確保顯示
            }
            if (imgData.info && imgData.info.trim() !== "") {
                photoCaption.innerHTML = imgData.info;
                photoCaption.style.display = 'block';
            } else {
                photoCaption.style.display = 'none';
            }
        };

        galleryContainer.appendChild(img);
    });
}

// 新增相機移動與資訊顯示邏輯
function syncCameraToView(pos, lookAt) {
    if (!viewer.camera || !viewer.controls) return;

    // 直接設置相機位置
    viewer.camera.position.set(pos[0], pos[1], pos[2]);
    
    // 設置 OrbitControls 的 target (LookAt 點)
    viewer.controls.target.set(lookAt[0], lookAt[1], lookAt[2]);
    
    // 強制更新
    viewer.camera.updateProjectionMatrix();
    viewer.controls.update();

    console.log(`已同步至照片視角: ${pos}`);
}

// 點擊彈窗背景或關閉按鈕時隱藏
const overlay = document.getElementById('photo-overlay');
if (overlay) {
    overlay.addEventListener('click', (e) => {
        // 如果點擊的是背景（不是照片本身），則關閉
        if (e.target === overlay || e.target.classList.contains('close-btn')) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    });
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

// 啟動執行
applyRoomMeta(meta);
loadGallery();

// // 2. 建立更新與監聽邏輯
// function setupCameraDebug() {
//     const posEl = document.getElementById('cam-pos');
//     const lookEl = document.getElementById('cam-look');

//     // 每幀更新顯示資訊
//     setInterval(() => {
//         if (viewer.camera) {
//             const pos = viewer.camera.position;
//             // 透過 OrbitControls 的 target 獲取 LookAt 點，若無則取相機前方向量
//             const lookAt = viewer.controls ? viewer.controls.target : new THREE.Vector3(0, 0, -1).applyQuaternion(viewer.camera.quaternion).add(pos);

//             posEl.innerText = `Position: [${pos.x.toFixed(4)}, ${pos.y.toFixed(4)}, ${pos.z.toFixed(4)}]`;
//             lookEl.innerText = `LookAt: [${lookAt.x.toFixed(4)}, ${lookAt.y.toFixed(4)}, ${lookAt.z.toFixed(4)}]`;
//         }
//     }, 100);

//     // 鍵盤按下 'C' 時印出可直接使用的程式碼
//     window.addEventListener('keydown', (e) => {
//         if (e.key.toLowerCase() === 'c') {
//             const pos = viewer.camera.position;
//             const lookAt = viewer.controls ? viewer.controls.target : new THREE.Vector3(0, 0, -1).applyQuaternion(viewer.camera.quaternion).add(pos);
            
//             const configString = `
// // 複製以下內容到 CAMERA_INIT
// position: [${pos.x.toFixed(5)}, ${pos.y.toFixed(5)}, ${pos.z.toFixed(5)}],
// lookAt: [${lookAt.x.toFixed(5)}, ${lookAt.y.toFixed(5)}, ${lookAt.z.toFixed(5)}],
//             `;
//             console.log("%c相機位置已擷取：", "color: #00ff00; font-weight: bold; font-size: 14px;");
//             console.log(configString);
//             alert("相機座標已印出在 Console (F12)");
//         }
//     });
// }


// const axesHelper = new THREE.AxesHelper(5);
// axesHelper.position.set(0, 0, 0);
// viewer.threeScene.add(axesHelper);
