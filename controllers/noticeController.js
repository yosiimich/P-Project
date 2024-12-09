const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnect");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken

//@desc Get notice page
//@route GET /
const getAllNotice = asyncHandler(async (req, res) => {
  try {
    const notices = await new Promise((resolve, reject) => {
      dbConnect.query("SELECT * FROM notice", [], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    console.log("Notices from DB:", notices);

    if (notices.length === 0) {
      return res.render("notice", { notices: [] });
    }

    const noticesWithUser = await Promise.all(
      notices.map(async (notice) => {
        const userEmail = notice.author_email;

        const userName = await new Promise((resolve, reject) => {
          dbConnect.query(
            "SELECT name FROM users WHERE email = ?",
            [userEmail],
            (error, results) => {
              if (error) {
                return reject(error);
              }
              resolve(results.length > 0 ? results[0].name : null);
            }
          );
        });

        return {
          ...notice,
          userName: userName,
        };
      })
    );

    console.log("Notices with user info:", noticesWithUser);

    res.render("notice", { notices: noticesWithUser });
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).render({ message: "Internal Server Error" });
  }
});

//@desc Get notice Detail page
//@route GET /:id
const getDetailNotice = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // 현재 공지사항 정보 가져오기
  dbConnect.query("SELECT * FROM notice WHERE id=?", [id], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  
    if (results.length == 0) {
      return res.status(401).json({ message: "Notice not found" });
    }
  
    const notice = results[0];
  
    // 작성자 정보 가져오기
    dbConnect.query("SELECT * FROM users WHERE email=?", [notice.author_email], (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
  
      if (results.length == 0) {
        return res.status(401).json({ message: "Writer not found" });
      }
  
      const user = results[0];
  
      // 이전글과 다음글 가져오기
      dbConnect.query("SELECT * FROM notice WHERE id < ? ORDER BY id DESC LIMIT 1", [id], (error, prevResults) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
  
        const prevNotice = prevResults.length > 0 ? prevResults[0] : null;
  
        dbConnect.query("SELECT * FROM notice WHERE id > ? ORDER BY id ASC LIMIT 1", [id], (error, nextResults) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error" });
          }
  
          const nextNotice = nextResults.length > 0 ? nextResults[0] : null;
  
          // 공지사항과 작성자 정보를 렌더링
          res.render("noticeDetail", {
            notice: notice,
            userName: user.name,
            prevNotice: prevNotice,  // 이전글 정보
            nextNotice: nextNotice,  // 다음글 정보
            layout: "layouts/mainFrame"  // 레이아웃 설정 (옵션)
          });
        });
      });
    });
  });  
});



module.exports = { getAllNotice, getDetailNotice };
