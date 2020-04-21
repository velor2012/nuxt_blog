export default ({ app,store,redirect}) => {
    app.router.beforeEach((to, from,next) => {
        // let is_login = store.state.login.is_login
        // if (!is_login && to.path !== '/login') {
        //     redirect('/login');
        // }else{
        //     next()
        // }
        if(to.path=='/home'){
            redirect('/home/article_table')
        }else if(to.path=='/'){
            redirect('/login')
        }else{
            next()
        }
    });
  };