const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const {_,jwt_refresh} = require("../config/jwt-util");
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
      const refreshToken = req.cookies.refreshToken;
      jwt_refresh(refreshToken);
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};

const checkAdmin = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== 1) {
      // 관리자 권한이 없으면 메인 페이지로 리디렉션
      return res.redirect("/");
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.redirect("/login");
  }
};

module.exports = { checkLogin, checkUser, checkAdmin };
