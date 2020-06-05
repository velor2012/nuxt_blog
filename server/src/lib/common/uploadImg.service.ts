import { Injectable, HttpService, Logger, Inject } from '@nestjs/common';
import imgUploadParam from '../types/imgParam';
import { v1 as uuidv1 } from 'uuid';
import * as fs from 'fs';
import { Base64 } from 'js-base64';
import { imgUploadReturn } from '../types';
import * as _ from 'lodash';
import * as request from 'request';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
@Injectable()
export abstract class ImgUploadService {
    public abstract async upload(file: any, param: imgUploadParam, prefix: string): Promise<imgUploadReturn>;
}

@Injectable()
export class githubUploader extends ImgUploadService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    super();
  }
  async upload(file: any, param: imgUploadParam, prefix: string = 'test') {
    let uuid: string = uuidv1();
    let extName: string = file.originalname.split('.').pop();
    let isEmpty = /^\s+$/.test(prefix);
    let filePath = null;
    if (prefix != null && prefix != '' && !isEmpty) {
      if (param.type == 'contentImg' && param.id != null && param.id != '') {
        filePath = `${prefix}/${param.id}/${uuid}.${extName}`;
      } else if (param.type != 'contentImg') {
        filePath = `${prefix}/${param.type}/${uuid}.${extName}`;
      } else {
        filePath = `${prefix}/noid/${uuid}.${extName}`;
      }
    } else {
      filePath = `${uuid}.${extName}`;
    }

    // 上传原图
    let encode_file = Base64.encode(file.buffer);
    let github_user = process.env.GITHUB_USER;
    let repo = process.env.GITHUB_REPO;
    let token = process.env.GITHUB_TOKEN;
    let proxy = process.env.GITHUB_PROXY;
    var url = `https://api.github.com/repos/${github_user}/${repo}/contents/nestblog/${filePath}`;

    let request_config = {
      url: url,
      method: 'put',
      proxy: proxy,
      headers: {
        //设置请求头
        'content-type': 'application/json',
        Authorization: `token ${token}`,
        'User-Agent': 'cwy',
      },
      json: true,
      body: {
        message: 'nest test',
        content: encode_file,
      },
    };
    if (!_.isEmpty(proxy) && !_.isNull(proxy) && !_.isUndefined(proxy)) {
      request_config = { ...request_config, ...{ proxy: proxy } };
    }

    let res = await new Promise((resolve, reject) =>
      request(request_config, (err, response, body) => {
        if (err) {
          reject(err);
        } else {
          resolve(body);
        }
      }),
    ).catch((err: Error) => this.logger.error('上传失败: ', err.stack));
    let return_path = _.get(res, 'content.path');
    return new imgUploadReturn(
      file.originalname,
      `${uuid}.${extName}`,
      `https://cdn.jsdelivr.net/gh/${github_user}/${repo}/${return_path}`,
    );
    // console.log('usegithub');
  }
}

@Injectable()
export class localUploader extends ImgUploadService {
  async upload(file: any, param: imgUploadParam, prefix: string = '') {
    let uuid: string = uuidv1();
    let extName: string = file.originalname.split('.').pop();
    let isEmpty = /^\s+$/.test(prefix);
    let filePath = null;
    fs.writeFileSync(`static/${uuid}.${extName}`, file.buffer);
    return new imgUploadReturn(
      file.originalname,
      `${uuid}.${extName}`,
      `http://${process.env.HOST}:${process.env.PORT}/${uuid}.${extName}`,
    );
  }
}
