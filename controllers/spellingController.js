const asyncHandler = require("express-async-handler");
const dbConnect = require('../config/dbConnect');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken


//@desc Get spelling-check page
//@route GET /
const getSpelling = (req, res) => {
    res.render("spelling-check");
};  

//@desc Post spelling-check page
//@route POST /
const saveScript= async (req, res, next) => {
    const { title, text } = req.body;
    const token = req.cookies.token
    const decoded = jwt.verify(token, jwtSecret); 
    const email = decoded.email;

    if (!title || !text ) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    dbConnect.query('INSERT INTO script (author_email, title, content) VALUES (?, ?, ?)', [email, title, text], function (error, results) {
      if (error) {
        console.error("Error inserting script:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      req.scriptId = results.insertId;
      next();
    });
  };

const spellCheck= asyncHandler(async(req, res)=>{
    console.log("spellCheck");
    const {title, text} = req.body;
    const scriptId = req.scriptId;
    const ai = "AI checker" // AI 
    
    dbConnect.query('INSERT INTO ai_script (script_id, text) VALUES (?, ?)', [scriptId, ai], function (error, results) {
        if (error) {
            console.error("Error inserting script:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        return res.status(200).json({
            title: title,
            user: text,
            ai: ai
        });
    });
    
});

module.exports ={getSpelling, saveScript, spellCheck}