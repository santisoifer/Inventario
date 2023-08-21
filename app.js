const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config()
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ? Cuando lo pase a db (IMPORTANTE: const userSchema = new mongoose.Schema({}), para que pueda agregar plugins):
// mySchema.plugin(passportLocalMongoose);

let UsersDB = [
    { username: "admin", password: "supersecretPassw0rdadmin" }
];

app.get("/", (req, res) => {
    res.render("signin");
});

app.post("/signIn", (req, res) => {
    const { username, password } = req.body;
    let inputs = { username: username, password: password };
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});