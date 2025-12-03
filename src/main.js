import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

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

// ==========================================
// 1. 全域設定與常數定義 (Config & Constants)
// ==========================================

// 模型設定
const MODEL_CONFIG = {
    path: 'assets/room1.ksplat',
    scale: [1.5, 1.5, 1.5],
    position: [0, 5, 0],
    // rotation: [0, 0, 0, 1],
    rotation: getRotationQuat(180, 0, 0), 
    alphaThreshold: 5, // 過濾雜訊閾值
};

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

// 相機移動邊界 (隱形牆)
const BOUNDS = {
    minX: -5, maxX: 5,
    minY: 0,  maxY: 3.5,
    minZ: -5, maxZ: 5
};

// 人眼高度設定 (模擬第一人稱視角)
const VIEW_HEIGHT = {
    min: 5.0, // 蹲下/坐下最低高度
    max: 20.0, // 站立最高高度
    targetOffset: 1.0 // 視線中心的高度 (比眼睛低一點，避免視角飄浮)
};

// 熱點資料 (未來可擴充為陣列)
const HOTSPOT_DATA = [
    {
        id: 'balcony', // 給每個熱點一個唯一 ID 比較好管理
        position: new THREE.Vector3(0, 1.0, -13.0),
        label: '陽台',
        description: '<strong>陽台</strong><br>落地窗，採光佳，面對大馬路。',
        color: 0x007bff
    },
    {
        id: 'kitchen',
        position: new THREE.Vector3(5.0, 1.2, 2.0), // 假設座標，請依實際場景調整
        label: '廚房',
        description: '<strong>開放式廚房</strong><br>附設電磁爐與烘碗機。',
        color: 0xff5722 // 橘色
    },
    {
        id: 'bedroom',
        position: new THREE.Vector3(-4.0, 1.5, 5.0), 
        label: '主臥',
        description: '<strong>主臥室</strong><br>雙人床大空間，附獨立衛浴。',
        color: 0x4caf50 // 綠色
    }
];


// ==========================================
// 2. 初始化 Viewer
// ==========================================

const viewer = new GaussianSplats3D.Viewer({
    'cameraUp': CAMERA_INIT.up,
    'initialCameraPosition': CAMERA_INIT.position,
    'initialCameraLookAt': CAMERA_INIT.lookAt,
    'selfDrivenMode': true,
    'antialiased': true,
    'splatSortDistanceMapPrecision': 16,
});


// ==========================================
// 3. 載入場景與主邏輯
// ==========================================

viewer.addSplatScenes([{
    'path': MODEL_CONFIG.path,
    'showLoadingUI': true,
    'position':  MODEL_CONFIG.position,
    'rotation': MODEL_CONFIG.rotation,
    'scale': MODEL_CONFIG.scale,
    'splatAlphaRemovalThreshold': MODEL_CONFIG.alphaThreshold,
}])
.then(() => {
    console.log("✅ 模型載入完成！系統啟動中...");
    
    setupSceneObjects();  // 建立 3D 物件 (熱點、座標軸)
    setupUI();           // 建立 2D 介面 (標籤、資訊卡)
    setupControls();     // 設定相機控制器
    setupInteractions(); // 設定滑鼠互動
    startCustomRenderLoop(); // 啟動客製化渲染迴圈

    viewer.start();
})
.catch((err) => {
    console.error("❌ 載入錯誤:", err);
});


// ==========================================
// 4. 功能模組 (Functions)
// ==========================================

// 用來存貯所有熱點的 runtime 物件
// 結構範例: { mesh: THREE.Mesh, label: HTMLDivElement, data: Object }
const activeHotspots = []; 
let infoDiv;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * 設定 3D 場景物件 (熱點球體、座標軸)
 */
function setupSceneObjects() {
    const threeScene = viewer.threeScene;

    // A. 建立熱點球體
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    // 遍歷設定檔，生成每個熱點
    HOTSPOT_DATA.forEach(config => {
        // 1. 建立 3D 球體
        const material = new THREE.MeshBasicMaterial({ color: config.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(config.position);
        // 將 config 綁定到 mesh 上，方便 Raycaster 點到時知道是誰
        mesh.userData = { hotspotId: config.id, description: config.description };
        
        threeScene.add(mesh);

        // 2. 儲存到陣列
        activeHotspots.push({
            mesh: mesh,
            label: null, // 等一下 setupUI 再填入
            data: config
        });
    });

    // B. 建立座標軸輔助 (長度 5)
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.set(0, 0, 0);
    threeScene.add(axesHelper);
}

/**
 * 設定 HTML UI 元素
 */
function setupUI() {
    // A. 為每個熱點建立標籤
    activeHotspots.forEach(hotspot => {
        const labelDiv = document.createElement('div');
        labelDiv.innerText = hotspot.data.label;
        labelDiv.className = 'hotspot-label';

        // 內聯樣式備援
        Object.assign(labelDiv.style, {
            position: 'absolute',
            top: '0', left: '0',
            padding: '4px 8px',
            background: 'rgba(0, 123, 255, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none', // 關鍵：讓點擊穿透
            transform: 'translate(-50%, -120%)',
            display: 'none'
        });
        document.body.appendChild(labelDiv);
        // 把生成的 div 存回物件，方便 render loop 更新位置
        hotspot.label = labelDiv; 
    });

    // B. 建立資訊卡 (點擊後顯示)
    infoDiv = document.createElement('div');
    infoDiv.className = 'hotspot-info';
    infoDiv.innerHTML = HOTSPOT_DATA.description;
    Object.assign(infoDiv.style, {
        position: 'absolute',
        top: '0', left: '0',
        padding: '10px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        maxWidth: '200px',
        display: 'none',
        zIndex: '100'
    });
    document.body.appendChild(infoDiv);
}

/**
 * 設定相機控制器行為
 */
function setupControls() {
    const controls = viewer.controls;

    // 阻尼效果 (平滑滑動)
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // 縮放限制
    controls.minDistance = 0.5;
    controls.maxDistance = 15.0;

    // 鎖定旋轉中心高度 (穩定視線)
    // controls.target.y = VIEW_HEIGHT.targetOffset;
}

/**
 * 設定互動事件 (點擊偵測)
 */
function setupInteractions() {
    window.addEventListener('click', (event) => {
        const rect = viewer.renderer.domElement.getBoundingClientRect();
        
        // 計算滑鼠在 Canvas 中的 NDC 座標
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, viewer.camera);
        // activeHotspots.map(h => h.mesh) 產生一個只包含 mesh 的陣列
        const hotspotMeshes = activeHotspots.map(h => h.mesh);
        const intersects = raycaster.intersectObjects(hotspotMeshes, false);

        if (intersects.length > 0) {
            // 取第一個點到的物件
            const hitMesh = intersects[0].object;
            const description = hitMesh.userData.description;

            // 更新資訊卡內容
            infoDiv.innerHTML = description;
            
            // 顯示資訊卡
            infoDiv.style.display = 'block';
            infoDiv.style.left = (event.clientX + 15) + 'px';
            infoDiv.style.top = (event.clientY + 15) + 'px';
        } else {
            infoDiv.style.display = 'none';
        }
    });
}

/**
 * 啟動客製化 Render Loop
 * 負責：相機限制、UI 位置更新
 */
function startCustomRenderLoop() {
    const originalRender = viewer.render.bind(viewer);

    viewer.render = () => {
        const camera = viewer.camera;
        const controls = viewer.controls;
        const canvas = viewer.renderer.domElement;

        // --- 1. 相機限制邏輯 ---
        
        // // A. 水平移動限制 (Clamp Position)
        // camera.position.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, camera.position.x));
        // camera.position.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, camera.position.z));

        // // B. 高度限制 (模擬人眼高度波動範圍)
        // camera.position.y = Math.max(VIEW_HEIGHT.min, Math.min(VIEW_HEIGHT.max, camera.position.y));

        // // C. 強制鎖定旋轉中心高度 (避免視線亂飄)
        // controls.target.y = VIEW_HEIGHT.targetOffset;

        // // D. 防撞保護 (防止卡死關鍵) 
        // // 計算相機到目標點的水平距離 (忽略高度差)
        // const dx = camera.position.x - controls.target.x;
        // const dz = camera.position.z - controls.target.z;
        // const distance = Math.sqrt(dx * dx + dz * dz);

        // const MIN_DISTANCE = 0.3; // 最小保持 0.5 公尺距離

        // if (distance < MIN_DISTANCE) {
        //     // 如果太近了，把相機「推」回去
        //     // 保持方向不變，但長度拉長到 MIN_DISTANCE
        //     // 避免除以 0 的風險
        //     const scale = MIN_DISTANCE / (distance || 0.001); 
            
        //     // 更新相機位置 (把相機往後推)
        //     camera.position.x = controls.target.x + dx * scale;
        //     camera.position.z = controls.target.z + dz * scale;
        // }
        
        // --- 2. 執行核心渲染 ---
        originalRender();


        // --- 3. UI 位置更新 (3D to 2D) ---

        // 強制更新矩陣確保投影準確
        camera.updateMatrixWorld();
        activeHotspots.forEach(hotspot => {
            const { mesh, label } = hotspot;
            
            // 防呆：確保 label 已經建立
            if (!label) return;

            const position = mesh.position.clone();
            position.project(camera); // 轉為 NDC

            // 檢查是否在相機背面
            if (position.z > 1) {
                label.style.display = 'none';
            } else {
                label.style.display = 'block';
                
                // NDC 轉 螢幕像素座標
                const x = (position.x * 0.5 + 0.5) * canvas.clientWidth;
                const y = (-(position.y * 0.5) + 0.5) * canvas.clientHeight;

                // 套用位置
                label.style.left = `${x}px`;
                label.style.top = `${y}px`;
            }
        });
    };
}
