# 百度地图v3离线版

### 介绍

基于百度地图v3版的离线地图示例，包含常用功能栗子。

在`bmap/map_api_v3.0.js`文件中进行相关配置：

```javascript
const bmapCfg = {
  enableOffline: false, // 是否启用离线
  imgext: ".png", // 瓦片图的后缀
  tiles_dir: "", // 普通瓦片图的地址
  tiles_hybrid: "", // 卫星瓦片图的地址
  tiles_self: "", // 自定义图层的地址
  tiles_server: "", // 瓦片服务地址
};
```

### 相关资料

- [百度地图 JavaScript API v3.0](https://lbsyun.baidu.com/index.php?title=jspopular3.0)
- [百度地图 JavaScript API v2.0类参考](https://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html)
- [百度地图 JavaScript API v3.0开源库汇总](https://lbsyun.baidu.com/index.php?title=jspopular3.0/openlibrary)
- [百度地图 DrawingManager鼠标绘制库](https://api.map.baidu.com/library/DrawingManager/1.4/docs/symbols/BMapLib.DrawingManager.html)
- [百度地图 InfoBox自定义信息窗口](http://api.map.baidu.com/library/InfoBox/1.2/docs/symbols/BMapLib.InfoBox.html)
- [百度地图 LuShu路书](http://api.map.baidu.com/library/LuShu/1.2/docs/symbols/BMapLib.LuShu.html)
- [国内常用地图瓦片源地址汇总](https://zhuanlan.zhihu.com/p/641436984)
- [离线环境下使用百度地图（js版）（展示自己的地图瓦片）3.0版本api](https://blog.csdn.net/weixin_47615289/article/details/134695238)
