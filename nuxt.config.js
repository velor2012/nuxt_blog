
module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [ 
      {src:"https://cdn.bootcss.com/marked/0.8.0/marked.js",type: 'text/javascript', charset: 'utf-8'},
   ],
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'view-design/dist/styles/iview.css',
    'assets/page-transletion.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    {src:'@/plugins/iview',ssr: true },
    {src:'@/plugins/vue-cookie',ssr: true },
    '@/plugins/axios',
    {src:'@/plugins/router',ssr: false},
    {src: "@/plugins/vue-markdown.js", ssr: false },
    { src: '@/plugins/croppa.js', ssr: false },
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  proxy: {
    '/uploadPotato': {
      target: 'https://images.ac.cn/api/upload',
      pathRewrite: {
        '^/uploadPotato' : '/'
      }
    }
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy'
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    },
    // 开启打包分析
    // analyze: true, 	
    // assetFilter: function(assetFilename) {	    		
    //   return assetFilename.endsWith('.js');	    	
    // },
    optimization: {},
    /**
     * 打包独立css文件
     */
    extractCSS: true,
  },
  server:{
    host:'127.0.0.1',
    port:4001
  },
}
