const express = require("express");
const methodOverride = require("method-override");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("./public"));
app.use(methodOverride("_method"));
app.use(cookieParser()); 

const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/loginRoutes"));
app.use("/history", require("./routes/historyRoutes"));
app.use("/mine", require("./routes/mineRoutes"));
app.use("/spell", require("./routes/spellingRoutes"));
app.use("/pronunciation", require("./routes/pronunciationRoutes"));

app.listen(port, () => {
  console.log(`${port}번 포트에서 서버 실행 중`);
});