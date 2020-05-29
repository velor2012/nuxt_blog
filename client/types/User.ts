export type userType = 'admin' | 'user'
export default class User {
    public _id?: string;

    public username: string;

    public password: string

    public role: userType

    public realname: string 
   
    public avatar: string
    
    public info:string
  }