const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

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
    const newUser = { username: username, password: password };

    const userFound = UsersDB.find(user => user.username === newUser.username);
    
    if (userFound !== undefined) {
        const userToSignIn = UsersDB.find(user => user.username === newUser.username && user.password === newUser.password);
        if (userToSignIn !== undefined) {
            console.log("Signed in succesfully!");
        } else {
            console.log("User with username: " + newUser.username + " founded. Password not correct");
        }
        
    } else {
        UsersDB.push(newUser);
        console.log("Added new user!");
    }
});

function checkUserAndPass(username, password) {
    
}

app.listen(3000, () => {
    console.log("server started on port 3000");
});