// 工具函數模組

// 取得 URL 參數
export function getUrlParam(key, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key) || defaultValue;
}

// DOM 快速選取
export function $(selector) {
  return document.querySelector(selector);
}

export function $id(id) {
  return document.getElementById(id);
}

// 陣列安全取值
export function getConfigByKey(configObj, key, fallbackKey = null) {
  if (configObj[key]) return configObj[key];
  if (fallbackKey && configObj[fallbackKey]) return configObj[fallbackKey];
  console.warn(`Config key "${key}" not found, using fallback or first available.`);
  return configObj[Object.keys(configObj)[0]];
}

// 初始化 DOM 結構
export function initAppDOM() {
  const app = $id('app');
  if (!app) {
    console.error('找不到 #app 元素');
    return false;
  }
  
  app.innerHTML = `
    <div id="view-container"></div>
    <div id="gallery-container"></div>
    <div id="measure-output" class="hidden">請點擊第一點</div>
  `;
  return true;
}

// ✨ 新增：根據性別取得頭像 emoji
function getAvatarByGender(gender) {
  const avatars = {
    male: '👨‍💼',      // 男性商務人士
    female: '👩‍💼',    // 女性商務人士
    default: '👤'     // 預設通用頭像
  };
  
  return avatars[gender] || avatars.default;
}

// 應用房間資訊到 UI
export function applyRoomMeta(meta) {
  const fields = {
    'listing-title': 'title',
    'listing-address': 'address',
    'listing-price': 'price',
    'listing-size': 'size',
    'listing-layout': 'layout',
    'listing-floor': 'floor',
    'listing-desc': 'desc',
    'agent-name': 'agentName',
    'agent-role': 'agentRole'
  };

  Object.entries(fields).forEach(([id, key]) => {
    const el = $id(id);
    if (el && meta[key]) {
      el.innerText = meta[key];
    }
  });

   // ✨ 新增：更新頭像
  const avatarEl = document.querySelector('.agent-info .avatar');
  if (avatarEl && meta.agentGender) {
    avatarEl.innerText = getAvatarByGender(meta.agentGender);
  }
}
