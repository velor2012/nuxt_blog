import Article from "./Article";
export class ArticleSearchOneResult {
    constructor(public article: Article, public score: number) {}
}
export class ArticleSearchReturn {
    constructor(
        public results: ArticleSearchOneResult[],
        public total: number
    ) {}
}
export class NoteForSearch {
    constructor(
        public _id: string,
        public name: string,
        public resume: string
    ) {}
}
export class NoteSearchOneResult {
    constructor(public note: NoteForSearch, public score: number) {}
}
export class NoteSearchReturn {
    constructor(public results: NoteSearchOneResult[], public total: number) {}
}
