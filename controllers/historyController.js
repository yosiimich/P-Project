const asyncHandler = require("express-async-handler");
const crypto = require('crypto');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;  // npm i jsonwebtoken
const dbConnect = require("../config/dbConnect");


//@desc Get history page
//@route GET /
const getHistory = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret); 
  const email = decoded.email;

  dbConnect.query(
    "SELECT * FROM script WHERE author_email = ?", 
    [email], 
    function (error, scriptResults) {
      if (error) {
        console.error("Error getting scripts:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (scriptResults.length === 0) {
        return res.status(200).json({ script: [] });
      }

      const scriptsWithAI = [];
      let remainingQueries = scriptResults.length;

      scriptResults.forEach((script) => {
        const scriptId = script.id;
        const scriptTitle = script.title;
        const scriptText = script.content;

        dbConnect.query('SELECT text FROM ai_script WHERE script_id = ?', [scriptId], (err, aiScriptResults) => {
          if (err) {
            console.error("Error fetching AI script data:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          const aiScriptText = aiScriptResults.length > 0 ? aiScriptResults[0].text : null;

          scriptsWithAI.push({
            id: scriptId,
            title: scriptTitle,
            text: scriptText,
            aiScript: {
              text: aiScriptText
            }
          });

          remainingQueries--;
          if (remainingQueries === 0) {
            res.status(200).json({ scripts: scriptsWithAI });
          }
        });
      });
    }
  );
});




module.exports ={getHistory}