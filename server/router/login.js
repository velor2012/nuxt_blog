const { User, ResMessage } = require("../models/models");

const express = require("express");

const router = express.Router();

const { auth, jwt, getMessageAndSend } = require("../util/util");
let config = require("../config.json");
SECRET = config.SECRET;

//添加auth，禁止其他人注册
router.post("/register", auth, async (req, res) => {
  const u = await User.findOne({ username: req.body.username });
  if (u != null) {
    getMessageAndSend(false, "username duplicate", {}, res);
  } else {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password
    });
    getMessageAndSend(true, "", { users: user }, res);
  }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    getMessageAndSend(false, "用户不存在", {}, res);
  } else {
    const isPasswordValid = require("bcrypt").compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      getMessageAndSend(false, "密码不正确", {}, res);
    } else {
      const token_data = jwt.sign({ id: String(user._id) }, SECRET,{expiresIn: 7*60*60*24}); //一般第二个参数不应该放在代码里面,是类似密码一样的隐私数据

      getMessageAndSend(true, "", { token: token_data, user: user }, res);
    }
  }
});

router.get("/profile", auth, async (req, res) => {
  res.send(req.user);
});
module.exports = router;
