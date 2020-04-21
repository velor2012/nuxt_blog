const express = require("express");
const request = require('request')
let config = require('../config.json').github
var proxy = config.proxy
const router = express.Router();
const {
  auth,
  jwt,
  getMessageAndSend,
  getAllFiles,
  deleteFile
} = require("../util/util");

router.get("/image/emoji", async (req, res) => {
  // result = getAllFiles("static/emoji");
  // result_slim = [];
  // //去掉路径前面的static,并把\\改成/
  // result.map(item => {
  //   item_processed = item.replace("static", "").replace(/\\/g, "/");
  //   result_slim.push(item_processed);
  // });
  // getMessageAndSend(true, "", { result: result_slim }, res);
  var url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/emoji`
  let promise = new Promise((resolve, reject) => request({
    url: url,
    method: 'GET',
    proxy: proxy,
    headers: {//设置请求头
        "content-type": "application/json",
        'Authorization': `token ${config.token}`,
        "User-Agent": "cwy"
    },
    }, (err, response, body) => {
        if (err) {
            reject(err);
        } else {
            resolve(body);
        }
    })).catch(err => { console.log(err) })

  let results = await promise
  if (typeof (results) != 'object') { 
    results = JSON.parse(results);
  }
  let items = []
  if (results instanceof Array) {
    results.map(item => {
      // console.log(item)
      items.push({ path: `https://cdn.jsdelivr.net/gh/${config.user}/${config.repo}/${item.path}`,origin_path:item.path, sha: item.sha })
    })
    getMessageAndSend(true, "", items, res);
  } else { 
    getMessageAndSend(false, "", {}, res);
  }
});
router.delete("/image/emoji", auth, async (req, res) => {
  let path = req.body.path
  let sha = req.body.sha
  var url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/${path}`
  let promise = new Promise((resolve, reject) => request({
    url: url,
    method: 'DELETE',
    proxy: proxy,
    headers: {//设置请求头
        "content-type": "application/json",
        'Authorization': `token ${config.token}`,
        "User-Agent": "cwy"
    },
    json: true,
    body: {
        message: 'test',
        sha: sha
    }
    }, (err, response, body) => {
        if (err) {
            reject(err);
        } else {
            resolve(body);
        }
    })).catch(err => { console.log(err) })

  let results = await promise
  // console.log(typeof(results))
  if (typeof (results) != 'object') { 
    results = JSON.parse(results);
  }
  let items = []
  if (results) {
    getMessageAndSend(true, "", items, res);
  } else { 
    getMessageAndSend(false, "", {}, res);
  }
});


module.exports = router;
