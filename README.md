# Kuki.github.io
just a mission for ...
# 汽车知识图谱 - 前端静态网站

这是一个使用HTML/CSS/JavaScript构建的前端静态网站，用于自然语言查询汽车详细信息。该网站可以部署在GitHub Pages上。

## 部署到GitHub Pages

1. 将整个`frontend`目录推送到GitHub仓库
2. 在GitHub仓库设置中，启用GitHub Pages，选择主分支的根目录
3. 等待GitHub Pages构建完成，获取访问URL

## 使用说明

1. 在搜索框中输入自然语言查询，例如"15万左右的SUV推荐"
2. 点击搜索按钮或按回车键提交查询
3. 查看返回的结果，可以切换列表视图或网格视图
4. 使用高级筛选功能进一步过滤结果
5. 点击"详情"按钮查看汽车详细信息

## 技术栈

- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6+)
- Font Awesome图标
- 响应式设计，适配移动设备

## 与后端集成

前端通过AJAX调用后端Flask API。请确保修改`js/script.js`中的`API_BASE_URL`变量，指向您的实际后端服务地址。

## 自定义

您可以根据需要修改样式、添加新功能或调整布局。主要文件:
- `index.html` - 主页面结构
- `css/style.css` - 样式表
- `js/script.js` - 交互逻辑
