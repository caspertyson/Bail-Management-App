const postgres = require("postgres");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const pool = require("./db");
const bodyParser = require("body-parser");
const path = require("path")
const PORT = process.env.port || 5000
//process.env.PORT

const app = express();

//--------------------------------------MIDDLEWARE--------------------------------------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "client/build")))
}

//--------------------------------------ROUTES-----------------------------------------------------------------------

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("No User Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;

        res.json({ success: "true", userID: user.rows[0].user_id });
      });
    }
  })(req, res, next);
});
app.post("/register", async (req, res) => {
  try {
    const user = await pool.query(`SELECT * FROM users WHERE userName = $1`, [
      req.body.username,
    ]);
    if (user.rows.length == 0) {
      const passwordHashed = await bcrypt.hash(req.body.password, 10);
      await pool.query(
        `INSERT INTO users(userName,passwordHash) VALUES($1,$2)`,
        [req.body.username, passwordHashed]
      );
      res.send("User Created");
    } else {
      res.send("User Already Exists");
    }
  } catch (err) {
    console.error(err.message);
  }
});
app.post("/logCheck", async (req, res) => {
  try{
      await pool.query(
        `INSERT INTO bailchecks(officerid,persononbailid,checktime,personpresent) VALUES($1,$2, $3, $4)`,
        [req.body.officerid, req.body.persononbailid,req.body.checktime,req.body.personpresent]
      );
      res.send("Log added");
  }catch(err){
    console.error(err.Message)
  }
})
app.get("/getPersonsOnBail", async (req, res) => {
  try{
      const people = await pool.query(`SELECT * FROM peopleonbail`);
      res.send(people.rows);
  }catch(err){
    console.error(err.Message)
  }
})
app.get("/getUser", (req, res) => {
  console.log(req)
  res.send(req.user);
});
app.listen(5000, () => {
  console.log("Server has started");
});
