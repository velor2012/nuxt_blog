const express = require("express");
const router = express.Router();
//相当于后台的路由，所有的后台处理都需要从这里经过

const login = require("./login");
const user = require("./user");
const draft = require("./draft");
const blog = require("./blog");
const uploadImg = require("./uploadImg");
const image = require("./image");
const system = require("./system");
router.use("/", login);
router.use("/", user);
router.use("/", blog);
router.use("/", uploadImg);
router.use("/", image);
router.use("/", draft);
router.use("/", system);
module.exports = router;
