export const state = () => ({
    counter: 0,
    username:'',
    is_login:false,
    token:NaN
  })
export const mutations = {
    increment (state) {
        state.counter++
    },
    setUserName(state,name){
        state.username = name
    },
    _login(state){
        state.is_login = true
    },
    _exit(state){
        state.is_login = false
    },
    setToken(state,token){
        state.token = token
    },
    increment (state) {
        state.counter++
    },
}
export const getters = {
    getUserName(state){
        return state.username
    },
    getLogin(state){
        return state.is_login
    },
    getToken(state){
        return state.token
    },
}
