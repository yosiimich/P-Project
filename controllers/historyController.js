const asyncHandler = require("express-async-handler");
const crypto = require('crypto');
require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const dbConnect = require("../config/dbConnect");

//@desc Get history page
//@route GET /
const getHistory = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, jwtSecret); 
  const email = decoded.email;

  try {
    const scriptResults = await new Promise((resolve, reject) => {
      dbConnect.query("SELECT * FROM script WHERE author_email = ?", [email], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (scriptResults.length === 0) {
      return res.status(200).json({ script: [] });
    }

    const scriptsWithAI = await Promise.all(scriptResults.map(async (script) => {
      const scriptId = script.id;
      const scriptTitle = script.title;
      const scriptText = script.content;
      const scriptTime = script.created_at;

      const aiScriptText = await new Promise((resolve, reject) => {
        dbConnect.query('SELECT text FROM ai_script WHERE script_id = ?', [scriptId], (err, aiScriptResults) => {
          if (err) {
            return reject(err);
          }
          resolve(aiScriptResults.length > 0 ? aiScriptResults[0].text : null);
        });
      });

      return {
        id: scriptId,
        title: scriptTitle,
        text: scriptText,
        time: scriptTime,
        aiScript: {
          text: aiScriptText
        }
      };
    }));

    const voiceResults = await new Promise((resolve, reject) => {
      dbConnect.query("SELECT * FROM voice WHERE author_email = ?", [email], (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });

    if (voiceResults.length === 0) {
      return res.status(200).json({ voice: [] });
    }

      const voiceWithAI = await Promise.all(voiceResults.map(async (voice) => {
      const voiceId = voice.id;
      const voiceurl = voice.url;
      const voiceTime = voice.created_at;

      const aivoiceText = await new Promise((resolve, reject) => {
        dbConnect.query('SELECT * FROM ai_voice WHERE voice_id = ?', [voiceId], (err, aiScriptResults) => {
          if (err) {
            return reject(err);
          }
          if (aiScriptResults.length > 0) { 
            resolve({ user: aiScriptResults[0].user, ai: aiScriptResults[0].ai }); 
          } 
          else { 
            resolve({ user: null, ai: null });
          }
        });
      });

      return {
        id: voiceId,
        url: voiceurl,
        time: voiceTime,
        aiScript: {
          userText: aivoiceText.user,
          aiText: aivoiceText.ai
        }
      };
    }));

    res.status(200).json({
      scripts: scriptsWithAI,
      voice: voiceWithAI
    });
  } catch (error) {
    console.error("Error getting history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { getHistory };
