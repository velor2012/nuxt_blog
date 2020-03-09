export default ({ app,store,redirect}) => {
    app.router.beforeEach((to, from,next) => {
        let is_login = store.state.login.is_login
        if (!is_login && to.path !== '/login') {
            redirect('/login');
        }else{
            next()
        }
    });
  };