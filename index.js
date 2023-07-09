require("dotenv").config();
const express = require("express"); const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

app.use(express.json());

const users = require("./db/users.json");

app.post("/register", (req, res) => {
    if (users.find(user => user.username == req.body.username)) return res.status(403).send("User already exists");

    const username = req.body.username;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    users.push({username, password: hashedPassword});
    fs.writeFileSync("./db/users.json", JSON.stringify(users, null, 4), "utf-8");

    res.status(200).send("Success");
});

app.post("/login", async (req, res) => {
    const user = users.find(user => user.username == req.body.username);

    if (!user) return res.status(404).send("User does not exist");
    
    bcrypt.compare(req.body.password, user.password).then(result => {
        if (result) {
            const accessToken = jwt.sign({username: user.username}, process.env.ACCESS_TOKEN_SECRET);
            return res.status(200).send(`Welcome ${user.username} | ${accessToken} |`);
        }
        else return res.status(401).send("Invalid credentials");
    })
});

app.route("/post")
    .get((req, res) => {

    })
    .post((req, res) => {

    })

function authMiddleware(req, res, next){

}

app.listen(3000);