const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

// 로그인 필수 체크
const checkLogin = async (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const token = req.cookies.token;

  console.log("토큰");
  console.log(token);
  if (!token) {
    return res.redirect("/");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    console.log("req.username");
    console.log(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
};

// 현재 로그인 상태 체크
const checkUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};

module.exports = { checkLogin, checkUser };
