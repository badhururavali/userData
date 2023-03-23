const express = require("express");
const app = express();
app.use(express.json());

const bcrypt = require("bcrypt");

const path = require("path");
const dbPath = path.join(__dirname, "userData");

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

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = bcrypt.hash(request.body.password);
  const selectUserQuery = `SELECT * FROM user WHERE username = ${username};`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const addUserQuery = `
    INSERT INTO user (username,name,password,gender,location} 
        VALUES (
            ${username},
            ${name},
            ${hashedPassword},
            ${gender},
            ${location}
        );`;
    const dbResponse = await db.run(addUserQuery);
    const newUserId = dbResponse.lastID;
    response.status = 200;
    response.send("User created successfully");
  }
  if (password.length < 5) {
    response.status = 400;
    response.send("password is too short");
  } else {
    response.status = 400;
    response.send("User already exits");
  }
});
