import * as THREE from 'three';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
// 1. 引入控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
// 2. 將背景改成灰色，避免模型太黑看不見
scene.background = new THREE.Color(0x333333);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(-1, -4, 6);
camera.lookAt(0, 4, 0);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. 加入控制器設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 啟用阻尼效果，滑動更有質感

// 紅色參考方塊 (位於 0,0,0)
const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
);
scene.add(box);

const viewer = new GaussianSplats3D.DropInViewer({
    'gpuAcceleratedSort': true,
    'sharedMemoryForWorkers': true
});

// 4. 載入模型並加入錯誤監聽
// ⚠️ 請務必確認這裡的 'your_real_filename.ksplat' 已經改成你 public/assets 下真正的檔名
const modelFile = 'assets/truck_high.ksplat'; 

// 定義一個變數來存取載入後的模型
let splatMesh; 

viewer.addSplatScenes([{
    'path': modelFile,
    'rotation': [0, 0, 0, 1],
    'scale': [1.0, 1.0, 1.0], // 先把 scale 改回 1，避免我們自己縮放導致混亂
    'splatAlphaRemovalThreshold': 0, // ⚠️ 改成 0：先不要過濾任何點，即使它很透明也要顯示出來
}])
.then(() => {
    console.log("✅ 模型載入成功！開始分析模型資訊...");

    // 方法修正：因為 DropInViewer 本身就是一個 Group，
    // 載入後的 Splat Mesh 會被加入到這個 Group 的 children 裡。
    // 我們試著直接抓取 viewer 的 children。
    
    let targetObject = null;
    
    // 嘗試在 children 中找到 Mesh 或 Points
    viewer.traverse((child) => {
        if (child.isMesh || child.isPoints) {
            // 找到第一個 Mesh 或 Points 物件，通常這就是我們的 splat 模型
            targetObject = child;
            console.log("🔍 找到內部物件:", child.type);
        }
    });

    // 如果找不到特定的 mesh，我們就直接把整個 viewer 當作目標
    if (!targetObject) {
        console.log("⚠️ 無法鎖定單一 Mesh，將使用整個 Viewer Group 進行計算");
        targetObject = viewer;
    }

    // --- 以下邏輯與之前相同，但目標改為 targetObject ---

    // 1. 計算邊界框
    const box3 = new THREE.Box3().setFromObject(targetObject);
    
    // 檢查邊界框是否為空 (代表模型可能還沒準備好渲染，或真的是空的)
    if (box3.isEmpty()) {
        console.error("❌ 邊界框是空的！模型可能沒有頂點資料或尚未渲染。");
        return;
    }

    const size = new THREE.Vector3();
    box3.getSize(size);
    const center = new THREE.Vector3();
    box3.getCenter(center);
    
    console.log(`📏 模型尺寸: x:${size.x.toFixed(2)}, y:${size.y.toFixed(2)}, z:${size.z.toFixed(2)}`);
    console.log(`📍 模型中心: x:${center.x.toFixed(2)}, y:${center.y.toFixed(2)}, z:${center.z.toFixed(2)}`);

    // 2. 畫出黃色框框
    const helper = new THREE.Box3Helper(box3, 0xffff00);
    scene.add(helper);
    
    // 3. 自動調整相機
    const maxDim = Math.max(size.x, size.y, size.z);
    // 避免 maxDim 為 0 或無限大
    if (!isFinite(maxDim) || maxDim === 0) {
         console.error("❌ 模型尺寸異常，無法自動對焦");
         return;
    }

    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
    if (cameraZ < 1) cameraZ = 5; 
    
    // 稍微拉遠一點，乘上 1.5 倍
    cameraZ *= 1.5;

    camera.position.set(center.x, center.y, center.z + cameraZ);
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
    
    console.log(`📷 相機已重新定位到: ${camera.position.toArray()}`);
    })
    .catch((error) => {
        console.error("❌ 模型載入失敗:", error);
    });

scene.add(viewer);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // 更新控制器
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
