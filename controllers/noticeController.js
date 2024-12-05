const asyncHandler = require("express-async-handler");
const dbConnect = require('../config/dbConnect');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken


//@desc Get spelling-check page
//@route GET /
const getNotice = (req, res) => {
    res.render("notice");
};  

module.exports ={getNotice}