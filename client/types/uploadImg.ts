import _ from "lodash";

export type imgType = 'cover' | 'emoji' | 'contentImg' | 'gallery';
export type extendImgType = 'emoji' | 'gallery'
export default class imgUploadParam { 
    type: imgType;//需要指明上传的图片的类型
    id?: string;//如果是contentImg则必须要id，其他两个单独存放
    constructor(type: imgType, id?: string) { 
        this.type = type;
        if (!_.isEmpty(id)) {
            this.id = id;
        } else { 
            this.id = undefined
        }
    }
}
export class extendImgUploadParam { 
    type: extendImgType;//需要指明上传的图片的类型
    id?: string;//如果是contentImg则必须要id，其他两个单独存放
    constructor(type: extendImgType, id?: string) { 
        this.type = type;
        if (!_.isEmpty(id)) {
            this.id = id;
        } else { 
            this.id = undefined
        }
    }
}