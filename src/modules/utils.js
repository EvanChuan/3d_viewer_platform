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
    'agent_name': 'agentName',
    'agent_role': 'agentRole'
  };

  Object.entries(fields).forEach(([id, key]) => {
    const el = $id(id);
    if (el && meta[key]) {
      el.innerText = meta[key];
    }
  });
}
