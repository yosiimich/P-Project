const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken
const jwtRefresh = process.env.JWT_REFRESH_SECRET;
const dbConnect = require("../config/dbConnect");
const asyncHandler = require("express-async-handler");

const jwt_sign = (user) => {
  return new Promise((resolve, reject) => {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret, {
        expiresIn: '1D'
      }
    );
    const refresh = jwt.sign(
      { id: user.id},
      jwtRefresh, {
        expiresIn: '1Y'
      }
    );
    dbConnect.query("UPDATE users SET refreshToken = ? WHERE id = ?", [refresh, user.id], (error, results) => {
      if (error) {
        console.log("Error saving refresh token:", error);
        return reject(error);
      }
      const tokens={
        token: token,
        refresh: refresh
      }
      resolve(tokens);
    });
  });
}

const jwt_refresh = (refreshToken) => {
    console.log(refreshToken);
    if (!refreshToken) {
      return null
    }
  
    const decoded = jwt.verify(refreshToken, jwtRefresh);
  
    // 데이터베이스에서 refresh 토큰을 검증
    dbConnect.query("SELECT refreshToken FROM users WHERE id = ?", [decoded.userId], (error, results) => {
      if (error || results.length === 0 || results[0].refreshToken !== refreshToken) {
        return null;
      }
      const user = results[0];
      // 새로운 access 토큰 발급
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtSecret, 
        { expiresIn: '1D' });
      res.cookie("token", newAccessToken, { 
        httpOnly: true,
        maxAge: 24*60*60*1000, });
    });
    return "Success";
};
  

module.exports={
  jwt_sign,
  jwt_refresh
}