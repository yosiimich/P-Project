const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnect");
const crypto = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken
const {jwt_sign} = require("../config/jwt-util");


//@desc Get login page
//@route GET /
const getMain = async (req, res) => {
  try {
    // DB에서 핀된 공지사항 가져오기
    const pinnedNotice = await new Promise((resolve, reject) => {
      dbConnect.query(
        "SELECT * FROM notice WHERE pin = 1 ORDER BY created_at DESC LIMIT 1", // 핀된 공지 1개 가져오기
        [],
        (error, results) => {
          if (error) return reject(error);
          resolve(results.length > 0 ? results[0] : null); // 결과가 없으면 null 반환
        }
      );
    });

    // 공지사항 데이터를 메인 템플릿에 전달
    res.render("main", { pinnedNotice });
  } catch (error) {
    console.error("Error fetching pinned notice:", error);
    res.render("main", { pinnedNotice: null }); // 핀된 공지사항이 없거나 에러 발생 시 null 전달
  }
};

const getNotice = (req, res) => {
  res.render("notice");
};

//레이아웃 지정 필수
const getLogin = (req, res) => {
  res.render("login", {
    layout: "layouts/mainFrame", // 레이아웃 지정
  });
};

//@desc Login user
//@route POST /login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const pw = crypto.createHash("sha256").update(password).digest("hex");
  dbConnect.query(
    "SELECT * FROM users WHERE email = ? AND passwd = ?",
    [email, pw],
    function (error, results) {
      if (error) {
        console.error("Error reading users:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length > 0) {
        const user = results[0];

        jwt_sign(user)
          .then((tokens) => {
            // 관리자와 일반 사용자 리다이렉션 경로 설정
            const redirectUrl = user.role === 1 ? "/admin" : "/";
            console.log("Redirect URL:", redirectUrl); // 리다이렉션 경로 확인

            // JWT 토큰을 쿠키로 설정
            res.cookie("token", tokens.token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            res.cookie("refreshToken", tokens.refresh, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });

            // 클라이언트로 응답
            return res.status(200).json({ message: "Login successful", redirect: redirectUrl });
          })
          .catch((err) => {
            console.error("Error signing JWT:", err);
            res.status(500).json({ message: "Internal Server Error" });
          });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    }
  );
});



// @desc Logout
// @route GET /logout
const logout = (req, res) => {
  console.log("logout");

  const token = req.cookies.token;
  if (!token) {
    res.status(400).json({ message: "No token found" });
  }

  res.clearCookie("token", { httpOnly: true });
  //res.status(200).json({ message: "Logout successful" });
  return res.redirect("/");
};

// @desc Register Page
// @route GET /register
const getRegister = (req, res) => {
  res.render("register");
};

// @desc Register user
// @route POST /register
const registerUser = asyncHandler(async (req, res) => {
  const { email, name, password, password2 } = req.body;

  if (!email || !name || !password || !password2) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== password2) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const pw = crypto.createHash("sha256").update(password).digest("hex");
  dbConnect.query(
    "INSERT INTO users (email, name, passwd ,role) VALUES (?, ?, ?, 0)",
    [email, name, pw],
    function (error, results) {
      if (error) {
        console.error("Error inserting user:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.status(201).json({ message: "Register successful" });
    }
  );
});

module.exports = {
  getMain,
  getNotice,
  getRegister,
  getLogin,
  loginUser,
  logout,
  registerUser,
};
