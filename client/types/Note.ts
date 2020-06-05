export class Note {
    _id?: string;

    name: string ='';
    
    cover: string = ''

    categories: string[] =[];
    
    resume: string =''
    
    subDoc: SubDoc[] =[]
}

export class SubDoc{
    _id?:string

    public order: Number

    public title: string = ''

    public content: string = ''

    visits?:number
  }
  