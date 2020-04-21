export const state = () => ({
    types:[],
    colors:[],
  })
export const actions = {
    async nuxtServerInit ({ commit }, { app,req }) {
        let str = String(req.headers.cookie)
        let reg = /\s+token=(\S+)/;
        let match1 = str.match(reg)
        let reg2 = /username=(\S+);/;
        let match2 = str.match(reg2)
        let username = NaN
        let token =NaN
        if(match1 && match1.length>1){
            token = match1[1]
        }

        if(match2 && match2.length>1){
            username = match2[1]
        }
        if(token && username){
            commit('setToken',token)
            commit('setUserName',username)
            await commit('_login',true)
        }
    }
}
export const mutations = {
    setToken(state,token){
        state.login.token = token
    },
    setUserName(state,name){
        state.login.username = name
    },
    setTypes(state,types){
        state.types = types
    },
    _login(state){
        state.login.is_login = true
    },
    setColors(state,colors){
        state.colors = colors
    }
}
export const getters = {
    getTypes(state){
        return state.types
    },
    getColors(state){
        return state.colors
    }
}