const bmapCfg = {
  enableOffline: false, // 是否启用离线
  imgext: ".png", // 瓦片图的后缀
  tiles_dir: "", // 普通瓦片图的地址
  tiles_hybrid: "", // 卫星瓦片图的地址
  tiles_self: "", // 自定义图层的地址
  tiles_server: "", // 瓦片服务地址
};
const scripts = document.getElementsByTagName("script");
const JS__FILE__ = scripts[scripts.length - 1].getAttribute("src"); //获得当前js文件路径
bmapCfg.home = JS__FILE__.substring(0, JS__FILE__.lastIndexOf("/") + 1); //地图API主目录
(function() {
  window.BMap_loadScriptTime = (new Date).getTime();
  document.write('<script type="text/javascript" src="' + bmapCfg.home + 'library/bmap_offline_api_v3.0_min.js"></script>');
  document.write('<script type="text/javascript" src="' + bmapCfg.home + 'library/LuShu/LuShu_min.js"></script>');
  document.write('<script type="text/javascript" src="' + bmapCfg.home + 'library/InfoBox/InfoBox_min.js"></script>');
})();
