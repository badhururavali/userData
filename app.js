const express = require("express");
const app = express();
app.use(express.json());

const bcrypt = require("bcrypt");

const path = require("path");
const dbPath = path.join(__dirname, "userData.db");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("Server is Start at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializerDbAndServer();

// created new user
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const addUserQuery = `
    INSERT INTO user (username,name,password,gender,location)
        VALUES (
            '${username}',
            '${name}',
            '${hashedPassword}',
            '${gender}',
            '${location}'
        );`;
    const dbResponse = await db.run(addUserQuery);
    const newUserId = dbResponse.lastID;
    response.status(200);
    response.send("User created successfully");
  }
  if (password.length < 5) {
    response.status(400);
    response.send("password is too short");
  } else {
    response.status(400);
    response.send("User already exits");
  }
});

// login user

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const checkUser = `SELECT * FROM user WHERE username = '${username}';`;
  const dbUser = await db.get(checkUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPassWordIsMatched = await bcrypt.compare(password, dbUser.password);
    if (isPassWordIsMatched === true) {
      response.status(200);
      response.send(" login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// change password
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUser = `SELECT * FROM user where username = '${username}';`;
  const dbUser = await db.get(checkUser);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid username");
  }
  if (newPassword.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    const isMatchedPassword = await bcrypt.compare(
      oldPassword,
      dbUser.password
    );
    if (isMatchedPassword === true) {
      const updatePassword = ` UPDATE user SET password = '${newPassword}' WHERE username = '${username}' ;`;
      const newPassword = await db.run(updatePassword);
      response.status(200);
      response.send("Password Updated");
    } else {
      response.status(400);
      response.send("Invalid current Password");
    }
  }
});
