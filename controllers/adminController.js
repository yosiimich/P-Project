const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnect");
require("dotenv").config();

//@desc admin
//@route GET /admin
const getAdmin = (req, res) => {
  res.render("admin", { title: "관리자 대시보드" });
};

const getusers = async(req,res)=>{
    console.log("get all user info");
    dbConnect.query(
        "SELECT * FROM users",[],
        function (error, results) {
          if (error) {
            console.error("Error reading users:", error);
            res.status(500).json({ message: "Internal Server Error" });
          }
    
          if (results.length > 0 ) {
            const filteredResults = results.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }));
            return res.render("adminView", { title: "사용자 관리", users: filteredResults});
          } else {
            console.log("User not found");
            return res
              .status(401)
              .json({ message: "Invalid username or password" });
          }
        }
      );
}

const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    dbConnect.query("DELETE FROM users WHERE id = ?", [id], (error, results) => {
      if (error) {
        console.log("Error deleting user:", error);
        return res.status(500).json({ message: "Error deleting user" });
      }
      
      return res.redirect('/admin/user');
    });
  } catch (error) {
    console.error("Error Delete user:", error);
    return res.status(500).json({
      message: "Error Delete user"
    });
  }
};


const getScript = async(req,res)=>{
    try {
        const scriptResults = await new Promise((resolve, reject) => {
          dbConnect.query(
            "SELECT * FROM script",
            [],
            (error, results) => {
              if (error) return reject(error);
              resolve(results);
            }
          );
        });
    
        const scriptsWithAI = await Promise.all(
          scriptResults.map(async (script) => {
            const aiScriptText = await new Promise((resolve, reject) => {
              dbConnect.query(
                "SELECT text FROM ai_script WHERE script_id = ?",
                [script.id],
                (err, aiScriptResults) => {
                  if (err) return reject(err);
                  resolve(
                    aiScriptResults.length > 0 ? aiScriptResults[0].text : null
                  );
                }
              );
            });
    
            return {
              id: script.id,
              title: script.title,
              text: script.content,
              time: script.created_at,
              aiScript: {
                text: aiScriptText,
              },
            };
          })
        );
        res.render("adminView", { title: "스크립트 관리", scripts: scriptsWithAI });
    } catch (error) {
        console.error("Error getting script:", error);
        res.status(401).json({
            message: "Error getting scripts"
        });
      }
}

const deleteScript = async(req,res)=>{
    const id = req.params.id;
    try{
        dbConnect.query(
            "DELETE FROM script WHERE id = ?",[id],(error, results) =>{
              if (error) {
                console.log("Error deleting user:", error);
                return res.status(500).json({ message: "Error deleting script" });
              }
              
              return res.redirect('/admin/script');
            }
        );
    }catch(error){
        console.error("Error Delete script:", error);
        return res.status(401).json({
            message: "Error Delete script"
        });
    }
}

const getVoice = async(req,res)=>{
    try {
        const voiceResults = await new Promise((resolve, reject) => {
            dbConnect.query(
              "SELECT * FROM voice",
              [],
              (error, results) => {
                if (error) return reject(error);
                resolve(results);
              }
            );
          });
      
          const voiceWithAI = await Promise.all(
            voiceResults.map(async (voice) => {
              const aivoiceText = await new Promise((resolve, reject) => {
                dbConnect.query(
                  "SELECT * FROM ai_voice WHERE voice_id = ?",
                  [voice.id],
                  (err, aiScriptResults) => {
                    if (err) return reject(err);
                    if (aiScriptResults.length > 0) {
                      resolve({
                        user: aiScriptResults[0].user,
                        ai: aiScriptResults[0].ai,
                      });
                    } else {
                      resolve({ user: null, ai: null });
                    }
                  }
                );
              });
      
              return {
                id: voice.id,
                url: voice.url,
                time: voice.created_at,
                aiScript: {
                  userText: aivoiceText.user,
                  aiText: aivoiceText.ai,
                },
              };
            })
          );
      
          // JSON 응답 대신 페이지 렌더링
          res.render("adminView", {title: "발음 관리", voices: voiceWithAI});
    } catch (error) {
        console.error("Error getting voices:", error);
        
      }
}

const deleteVoice = async(req,res)=>{
    const id = req.params.id;
    try{
        dbConnect.query(
            "DELETE FROM voice WHERE id = ?",[id],(error, results) =>{
              if (error) {
                console.log("Error deleting user:", error);
                return res.status(500).json({ message: "Error deleting voice" });
              }
              
              return res.redirect('/admin/voice');
            }
        );
    }catch(error){
        console.error("Error Delete voice:", error);
        return res.status(401).json({
            message: "Error Delete voice"
        });
    }
}

const getNotice = async(req,res) =>{
  console.log("get all notice info");
  dbConnect.query(
      "SELECT * FROM notice",[],
      function (error, results) {
        if (error) {
          console.error("Error reading notice:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
  
        if (results.length > 0 ) {
          
          return res.render("adminView", { title: "공지사항 관리", results });
          
        } else {
          console.log("notice not found");
          return res
            .status(401)
            .json({ message: "Invalid notice" });
        }
      }
    );
}

const getANotice = async(req,res) =>{
  console.log("get a notice info");
  const id = req.params.id;

  dbConnect.query(
      "SELECT * FROM notice where id = ?",[id],
      function (error, results) {
        if (error) {
          console.error("Error reading notice:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
  
        if (results.length > 0) {
          return res.render("noticeCRU", { results: results[0], title: "공지사항 수정" });
        } else {
          console.log("Notice not found");
          return res.status(404).json({ message: "Notice not found" });
        }
      }
    );
}

const makeNotice = async(req,res) =>{
  res.render('noticeCRU', { title: "공지사항 생성" })
}

const postNotice = async(req,res) =>{
  console.log("get all notice info");
  const id = req.params.id;
  const {title, content,pin} = req.body
  const email = "admin123@gmail.com"
  let boolPin = false
  if(pin ==="true"){
      boolPin=true;
  }
  dbConnect.query(
      "INSERT INTO notice (author_email, title, content, pin) values (?,?,?,?)",[email, title, content, boolPin],
      function (error, results) {
        if (error) {
          console.error("Error make notice:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        res.redirect("/admin/notice");
      }
    );
}

const putNotice = async(req,res) => {
  console.log("get put notice info");
  const id = req.params.id;
  const { title, content, pin } = req.body;
  console.log(req.body);
  const email = "admin123@gmail.com";
  let boolPin = pin === "true" ? true : false;

  dbConnect.query(
    "UPDATE notice SET author_email=?, title=?, content=?, pin=? WHERE id=?",
    [email, title, content, boolPin, id],
    function (error, results) {
      if (error) {
        console.error("Error update notice:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // 수정 완료 후 공지사항 관리 페이지로 리다이렉트
      res.redirect("/admin/notice");
    }
  );
}


const deleteNotice = async(req,res)=>{
  const id = req.params.id;
  try{
      dbConnect.query(
          "DELETE FROM notice WHERE id = ?",[id],(error, results) =>{
            if (error) {
              console.log("Error deleting user:", error);
              return res.status(500).json({ message: "Error deleting script" });
            }
            
            return res.redirect('/admin/notice');
          }
      );
  }catch(error){
      console.error("Error Delete notice:", error);
      return res.status(401).json({
          message: "Error Delete notice"
      });
  }
}




module.exports = {
  getAdmin,
  getusers,
  deleteUser,
  getScript,
  deleteScript,
  getVoice,
  deleteVoice,
  getNotice,
  getANotice,
  makeNotice,
  postNotice,
  putNotice,
  deleteNotice
};