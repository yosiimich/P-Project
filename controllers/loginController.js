const asyncHandler = require("express-async-handler");
const dbConnect = require('../config/dbConnect');
const crypto = require('crypto');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken

//@desc Get login page
//@route GET /
const getMain = (req, res)=>{
  res.render("main");
};

const getLogin = (req, res) => {
  res.render("login");
};  

//@desc Login user
//@route POST /login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const pw = crypto.createHash('sha256').update(password).digest('hex');
  dbConnect.query('SELECT * FROM users WHERE email = ? AND passwd = ?', [email, pw], function(error, results) {
    if (error) {
      console.error("Error reading users:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length > 0) {
      console.log(results);
      const token = jwt.sign({ id: results[0].email, role: results[0].role }, jwtSecret);
      res.cookie("token", token, { httpOnly: true });
      return res.status(200).json({ message: "Login successful", token });
    } else {
      console.log('User not found');
      return res.status(401).json({ message: "Invalid username or password" });
    }
  });
});




// @desc Logout
// @route GET /logout
const logout = (req, res) => {
  console.log('logout');
  
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "No token found" });
  }

  res.clearCookie("token", { httpOnly: true });
  res.status(200).json({ message: "Logout successful" });
};


// @desc Register Page
// @route GET /register
const getRegister = (req,res)=>{
  res.render('register');
};

// @desc Register user
// @route POST /register
const registerUser = asyncHandler(async (req, res) => {
  const { username, name, password, password2 } = req.body;

  if (!username || !name || !password || !password2) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== password2) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const pw = crypto.createHash('sha256').update(password).digest('hex');
  dbConnect.query('INSERT INTO users (username, name, password) VALUES (?, ?, ?)', [username, name, pw], function (error, results) {
    if (error) {
      console.error("Error inserting user:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(201).json({ message: "Register successful" });
  });
});


module.exports = {getMain, getRegister,getLogin, loginUser, logout, registerUser };
