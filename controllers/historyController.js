const asyncHandler = require("express-async-handler");
const crypto = require('crypto');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken
const dbConnect = require("../config/dbConnect");


//@desc Get history page
//@route GET /
const getHistory = asyncHandler(async (req, res) => {

  const token = req.cookies.token
  const decoded = jwt.verify(token, jwtSecret); 
  const email = decoded.email;

  dbConnect.query(
    "Select id, title, content from script where author_email = ? ",
    [email],
    function (error, results) {
      if (error) {
        console.error("Error get scripts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (results.length === 0) {
        return res.status(200).json({script: results});
      }
      const scriptId = results[0].id;
      const scriptTitle = results[0].title;
      const scriptText = results[0].content;

      dbConnect.query('SELECT text FROM ai_script WHERE script_id = ?', [scriptId], (err, aiScriptResults) => {
        if (err) {
          console.error("Error fetching AI script data:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        const aiScriptText = aiScriptResults[0].text;

        res.status(200).json({
          script: {
            id: scriptId,
            title: scriptTitle,
            text: scriptText
          },
          aiScript: {
            text: aiScriptText
          }
        });
      });
    }
  );
});



module.exports ={getHistory}