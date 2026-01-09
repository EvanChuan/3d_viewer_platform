＃ 單一網頁式瀏覽
1.3d訓練模型與照片透過"gaussian-splatting"生成結果
2.將生成結果放到public資料夾底下
    3d模型：public/assets
    image:public/data/room{ID}/images
    模型轉換：https://projects.markkellogg.org/threejs/demo_gaussian_splats_3d.php
3.修改src/main.js中的
    // 房間資訊 ROOM_META
    // 針對不同房間的設定 ROOM_CONFIGS
4.確認網頁符合預期即可git push重新在vercel中depoly

# 網頁瀏覽切換房型說明： (在尾部加入/?id=room*)
http://localhost:5173/?id=room2
https://3d-viewer-platform.vercel.app/?id=room2