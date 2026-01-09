import * as THREE from 'three';

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

// 3D 模型與照片配置
export const ROOM_MODELS = {
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
    alphaThreshold: 5,
  },
  
  room2: {
    path: 'assets/room2.ksplat',
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
    alphaThreshold: 5,
  },
  
  room3: {
    path: 'assets/room3.splat',
    imagepath: 'data/room3/images/',
    images: ['img_01.jpg', 'img_02.jpg', 'img_03.jpg', 'img_04.jpg', 'img_05.jpg'],
    cameraInit: {
      up: [0, 1, 0],
      position: [0, 1, 5],
      lookAt: [0, 0, 0]
    },
    scale: [1.0, 1.0, 1.0],
    position: [0, 0, 0],
    rotation: getRotationQuat(180, 0, 0),
    alphaThreshold: 5,
  },

  room4: {
    path: 'assets/room4.ksplat',
    imagepath: 'data/room4/',
    images: [
      {
        file: '0034.jpg',
        position: [-2.24465, 0.13153, -2.36976],
        lookAt: [0.52678, 0.29232, 1.35208],
        info: '<b>大門玄關</b><br>大門玄關設有收納櫃與分離式冷氣，上下班出入便利。'
      },
      {
        file: '0062.jpg',
        position: [0.69847, 0.29919, 5.84531],
        lookAt: [2.03876, -0.52167, 2.18779],
        info: '<b>客廳沙發</b><br>客廳擺放三人沙發與茶几，空間方正好利用。柔和燈光與抱枕佈置，適合休息與接待親友。'
      },
      {
        file: '0078.jpg',
        position: [3.68545, 0.31228, 2.13153],
        lookAt: [0.82289, -0.01427, 0.64399],
        info: '<b>廚房</b><br>一字型廚房配置，雙口爐與流理台一應俱全。大容量雙門冰箱緊鄰廚房區，收納與生活機能完善。'
      },
      {
        file: '0163.jpg',
        position: [4.69069, -0.13843, 3.15825],
        lookAt: [0.69908, -0.73009, 3.90352],
        info: '<b>客廳電視</b><br>客廳設有壁掛電視與電視櫃，附簡約綠植裝飾。'
      },
      {
        file: '0211.jpg',
        position: [1.98767, -0.02489, 1.88901],
        lookAt: [1.41427, -0.06736, 1.34014],
        info: '<b>陽台採光</b><br>後陽台採光佳，動線筆直方便料理與通風。'
      },
      {
        file: '0283.jpg',
        position: [-5.37961, 0.66018, -2.64505],
        lookAt: [-5.37136, 0.65721, -2.65611],
        info: '<b>通廊走到</b><br>走道連接客廳與房間，格局方正，動線分明。牆面掛有插畫與開關面板，細節設計提升整體質感。'
      }
    ],
    cameraInit: {
      up: [0, 1, 0],
      position: [1.83691, -0.07570, 5.21176],
      lookAt: [0.55904, 0.30015, 1.23866]
    },
    scale: [1.0, 1.0, 1.0],
    position: [0, 0, 0],
    rotation: getRotationQuat(-190, 0, 0),
    alphaThreshold: 5,
  },
};

// 預設相機配置 (備用)
export const DEFAULT_CAMERA = {
  up: [0, 1, 0],
  position: [-2.44040, 0.31066, 0.19306],
  lookAt: [1.33026, -0.28629, -1.54476]
};
