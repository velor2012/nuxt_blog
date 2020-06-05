export default class Article {
    _id?: string;

    title: string = "";

    content: string = "";

    cover: string = "";

    categories: String[] = [];

    resume: String = "";

    updatedTime: string = "";

    createdTime: string = "";

    visits?:number
}
