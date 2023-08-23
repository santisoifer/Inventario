const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require("dotenv").config()
const mongoose = require("mongoose");
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

mongoose.connect("mongodb://127.0.0.1:27017/inventario");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    products: Array
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

const itemSchema = {
    name: String,
    brand: String,
    quantity: Number
}

const Item = mongoose.model("Item", itemSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.redirect("/inventario");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newUser, err => {
        if (err) {
            console.log(err);
            res.redirect("/inventario");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/inventario");
            })
        }
    });

});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register({username: req.body.username, products:[]}, req.body.password, (err, user) => {
        if (!err) {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/inventario");
            });
        } else {
            console.log(err);
            res.redirect("/register");
        }
    });
});

app.get("/inventario", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index");
    } else {
        res.redirect("/login")
    }
});

app.get("/addItem", (req, res) => {
    res.render(addItem);
});

app.post("/addItem", (req, res) => {
    //TODO: crear new item en base al form y guardarlo. DOCS: 
    // https://mongoosejs.com/docs/api/model.html
});

app.post("/logout", (req, res) => {
    req.logOut(err => {
        if (!err) {
            res.redirect("/");
        } else {
            return err;
        }
    });
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});