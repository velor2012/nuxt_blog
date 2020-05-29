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
export class PagePath { 
    articlePages: ArticlePages = new ArticlePages()
    draftPages: DraftPages = new DraftPages()
    userPages: UserPages = new UserPages()
    categoryPages: CategoryPages = new CategoryPages()
    systemPage = '/system'
    loginPath = '/login'
}
const MyPagePath = new PagePath()
export default MyPagePath