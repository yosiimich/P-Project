const asyncHandler = require("express-async-handler");
const crypto = require('crypto');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken


//@desc Get login page
//@route GET /
const getHistory = (req, res) => {
    res.render("history");
};  

module.exports ={getHistory}