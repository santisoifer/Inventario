const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

let UsersDB = [
    { username: "admin", password: "supersecretPassw0rdadmin" }
];

app.get("/", (req, res) => {
    res.render("signin");
});

app.post("/signIn", (req, res) => {
    const { username, password } = req.body;
    let inputs = { username: username, password: password };

    const userFound = UsersDB.find(user => user.username === inputs.username);

    if (userFound !== undefined) { // Sign in user:
        // const userToSignIn = UsersDB.find(user => user.username === inputs.username);

        // Check password: 
        bcrypt.compare(inputs.password, userFound.password, function (err, result) {
            if (result) {
                console.log("Correct user: signed in successfully!");
            } else {
                console.log("Invalid password!");
            }
        });

    } else { //Create user: 
        bcrypt.hash(inputs.password, saltRounds, function (err, hash) {
            inputs.password = hash;
            UsersDB.push(inputs);
        });
        console.log("Added new user!");
    }
    console.log(UsersDB);
});

app.listen(3000, () => {
    console.log("server started on port 3000");
});