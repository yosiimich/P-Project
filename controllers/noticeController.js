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

module.exports = { getAllNotice };
