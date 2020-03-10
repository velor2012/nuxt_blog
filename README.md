# 说明

该项目只完成了初步工作,后端参考了大佬的[代码](https://github.com/warriorBrian/nuxt-blog)

[demo](http://www.velor2012.xyz:4001/home)  
由于安全的原因，只开放了读取的权限,上面的链接直接跳过了用户登录

后端的技术栈:  

1. 数据库：mongodb

2. 服务器框架：express

3. 前台框架：nuxt+iview-design

所有安装的库：

``` js
  "dependencies": {
    "@nuxtjs/axios": "^5.9.4",
    "axios": "^0.19.2",
    "bcrypt": "^3.0.7",
    "clipboard": "^2.0.5",
    "cors": "^2.8.5",
    "cross-env": "^5.2.0",
    "express": "^4.16.4",
    "highlight": "^0.2.4",
    "jsonwebtoken": "^8.5.1",
    "less": "^3.10.3",
    "less-loader": "^5.0.0",
    "markdown-toc": "^1.2.0",
    "moment": "^2.24.0",
    "mongoose": "^5.8.9",
    "multer": "^1.4.2",
    "nuxt": "^2.0.0",
    "uuid": "^3.4.0",
    "view-design": "^4.0.0",
    "vue-cookies": "^1.6.1",
    "vue-croppa": "^1.3.8",
    "vue-meditor": "^2.1.1",
    "vuex": "^3.1.2"
  },
  "devDependencies": {
    "nodemon": "^1.18.9",
    "vue-lazyload": "^1.3.3"
  }
```

有的库可能没用到，之后再排查

## 安装方法

1. 把文件下下来  

2. 确保你已经安装了nodejs,然后运行  

3. 如果在服务器部署,修改`nuxt.config.js`末尾`sever`地址,修改`server`文件夹的`config.json`,把`prod_url`换成你的服务器地址  
或者直接用`env_url`,数据库装好填好信息

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

## 运行截图(初版)

！[https://s2.ax1x.com/2020/03/10/8io1MV.png](https://s2.ax1x.com/2020/03/10/8io1MV.png)
![https://s2.ax1x.com/2020/03/10/8ih2jO.png](https://s2.ax1x.com/2020/03/10/8ih2jO.png)
![https://s2.ax1x.com/2020/03/10/8ihc36.png](https://s2.ax1x.com/2020/03/10/8ihc36.png)
![https://s2.ax1x.com/2020/03/10/8ih69x.png](https://s2.ax1x.com/2020/03/10/8ih69x.png)
![https://s2.ax1x.com/2020/03/10/8ihfDe.png](https://s2.ax1x.com/2020/03/10/8ihfDe.png)
![https://s2.ax1x.com/2020/03/10/8ihs41.png](https://s2.ax1x.com/2020/03/10/8ihs41.png)

## 其他

这是由于疫情影响宅在家里无聊写的小项目，本人编程菜鸡，写来娱乐的，所以代码比较乱而且可能有些地方逻辑有些不太对,markdown第一次用,有点不习惯，排版难看，见谅  

