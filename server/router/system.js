const express = require("express");
const os = require("os");
const router = express.Router();
const { auth, jwt } = require("../util/util");
const { getMessageAndSend } = require("../util/util");

router.get("/system", (req, res) => {
  let {
    freemem,
    cpus,
    hostname,
    platform,
    release,
    totalmem,
    type,
    constants
  } = os;
  let total = parseInt(totalmem() / 1024 / 1024);
  let num = parseInt(freemem() / 1024 / 1024);
  let percentage = parseInt((num / total) * 100);
  info = {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    percentage,
    type: type(),
    totalmem: `${total}MB`,
    freemem: `${num}MB`,
    constants: constants.SIGTRAP ? "1" : "0",
    cpu: cpus()
  };
  getMessageAndSend(true, "", { info }, res);
});
module.exports = router;
