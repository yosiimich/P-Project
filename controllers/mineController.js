const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
require("dotenv").config();
const dbConnect = require("../config/dbConnect");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET; // npm i jsonwebtoken

//@desc Get login page
//@route GET /
const getMine = async(req, res) => {

    const token = req.cookies.token
    const decoded = jwt.verify(token, jwtSecret); 
    const email = decoded.email;

    dbConnect.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        function (error, results) {
          if (error) {
            console.error("Error reading users:", error);
            return res.status(500).json({ message: "Internal Server Error" });
          }
          if (results.length > 0) {
            console.log(results);
            res.render("mine", { user: results[0] });
          } else {
            console.log("User not found");
            return res
              .status(401)
              .json({ message: "Invalid email" });
          }
        }
      );
};  

module.exports = { getMine };
