# 说明

该项目只完成了基础部分工作,后端部分代码参考了大佬的[代码](https://github.com/warriorBrian/nuxt-blog)

[demo](https://www.velor2012.xyz:4001/home) 
由于安全的原因，只开放了读取的权限,上面的链接直接跳过了用户登录,访问的时候注意别开vpn

后端的技术栈:  

1. 数据库：mongodb

2. 服务器框架：express

3. 前台框架：nuxt+iview-design

4. 权限验证：jwt

5. 缩略图：sharp

图床：
 * github

## 安装方法

1. 把文件下下来  

2. 确保你已经安装了nodejs,sharp 

3. 如果在服务器部署,修改`nuxt.config.js`末尾`sever`地址,修改`server`文件夹的`config.json`,把`prod_url`换成你的服务器地址，`config.json`修改其他的配置信息

4. 使用https的话需要拿到证书，替换`localhost+2.pem`和`localhost+2-key.pem`。使用http的话吧`server/index_http_back.js`替换掉`index.js`就好了

4. 

``` js
npm install

npm run build //或者直接 npm run dev

npm run start

```

## 目前完成的功能

1. 权限验证，登陆状态保存
2. 文章的最基础的增删改查,甚至连搜索都没有,
3. 草稿箱
4. 表情图片管理,以及插入上传的表情,点击自动复制链接,已转换成mardown格式,可以直接贴到markdown编辑器
5. 可以编辑文章的地方都设置了自动保存，默认间隔为一分钟
6. 目录功能
7. 系统状态查看功能

## 运行截图

![main-c468ad80-7bab-11ea-8aae-b309e077ec34.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-c468ad80-7bab-11ea-8aae-b309e077ec34.png)
![main-c873c290-7bb8-11ea-9573-117d3a017592.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-c873c290-7bb8-11ea-9573-117d3a017592.png)
![main-e223fe30-7bb8-11ea-9396-2d63a0ed53f5.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-e223fe30-7bb8-11ea-9396-2d63a0ed53f5.png)
![main-ed29a5f0-7bb8-11ea-9396-2d63a0ed53f5.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-ed29a5f0-7bb8-11ea-9396-2d63a0ed53f5.png)
![main-f8e77a20-7bb8-11ea-9396-2d63a0ed53f5.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-f8e77a20-7bb8-11ea-9396-2d63a0ed53f5.png)
![main-0295f650-7bb9-11ea-9396-2d63a0ed53f5.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e836afdd6aa30405538bb40/main-0295f650-7bb9-11ea-9396-2d63a0ed53f5.png)
![main-15b30a10-7bba-11ea-9396-2d63a0ed53f5.png](https://cdn.jsdelivr.net/gh/velor2012/imageHosting/blog/5e84dd0c92fe9e2b6c699183/main-15b30a10-7bba-11ea-9396-2d63a0ed53f5.png)

## 后续计划
* 使用scss管理css
* 优化页面代码，减少冗余
* 后台框架由express改为nestjs，这一步前后端都会换分支

## 其他

这是由于疫情影响宅在家里无聊写的小项目，本人编程菜鸡，写来娱乐的，所以代码比较乱而且可能有些地方逻辑有些不太对,markdown第一次用,有点不习惯，排版难看，见谅。 


