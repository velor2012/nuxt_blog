export class ArticlePages { 
    create = '/articles/create'
    getEditPath(id: string): string {
        return `/articles/edit/${id}`;
    }
    list = '/articles/list'
}
export class CategoryPages { 
    create = '/categories/create'
    getEditPath(id: string): string {
        return `/categories/edit/${id}`;
    }
    list = '/categories/list'
}
export class UserPages { 
    create = '/users/create'
    getEditPath(id: string): string {
        return `/users/edit/${id}`;
    }
    list = '/users/list'
}
export class DraftPages { 
    getEditPath(id: string): string {
        return `/drafts/edit/${id}`;
    }
    list = '/drafts/list'
}
export class NotePages {
    create = '/extend/notes/create'
    getEditPath(id: string): string {
        return `/extend/notes/edit/${id}`;
    }
    list = '/extend/notes/list'
}
export class ExtendPages { 
    emoji = '/extend/emoji'
    gallery = '/extend/gallery'
    note = new NotePages()
}

export class PagePath { 
    articlePages: ArticlePages = new ArticlePages()
    draftPages: DraftPages = new DraftPages()
    userPages: UserPages = new UserPages()
    categoryPages: CategoryPages = new CategoryPages()
    systemPage = '/system'
    loginPath = '/login'
    logPage = '/logPage'
    extendPages:ExtendPages = new ExtendPages()
}
const MyPagePath = new PagePath()
export default MyPagePath