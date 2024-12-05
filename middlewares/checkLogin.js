const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

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

module.exports = checkLogin;
