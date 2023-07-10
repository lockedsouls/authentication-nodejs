require("dotenv").config();
const express = require("express"); const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

app.use(express.json());

const users = require("./db/users.json");
const posts = require("./db/posts.json");

app.post("/register", (req, res) => {
    if (users.find(user => user.username == req.body.username)) return res.status(403).send("User already exists");

    const username = req.body.username;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    users.push({username, password: hashedPassword});
    fs.writeFileSync("./db/users.json", JSON.stringify(users, null, 4), "utf-8");

    res.status(200).send("Success");
});

app.post("/login", alreadyLoggedIn, (req, res) => {
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
    .get(authTokenMiddleware, (req, res) => {
        res.status(200).json(posts);
    })
    .post(authTokenMiddleware, (req, res) => {
        //blah blah
        //get name and desc from req.body
        //push it to post
        //fs.writeFile blah blah
        res.status(200).send("Magic behind the scene");
    })

function authTokenMiddleware(req, res, next){
    const token = req.headers["authorization"] ?? req.headers["authorization"].split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) return res.status(401).send("Unauthorized");
        req.payload = payload;
        next();
    })
}

function alreadyLoggedIn(req, res, next){
    const token = req.headers["authorization"] ?? req.headers["authorization"].split(" ")[1];
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
            if (error) return res.status(401).send("Invalid token");
            res.status(300).send("Already logged in");
            next();
        })
    }
}

app.listen(3000);