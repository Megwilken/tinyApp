const bcrypt = require("bcryptjs");

// helper function to generate random string
function generateRandomString() {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// helper function to check email
function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

// helper function to check passwords
function passwordChecker(password, users) {
  for (let user in users) {
    if (users[user].password === password) {
      return users[user];
    }
  }
  return null;
}

// helper function - returns urls where userID equals id of logged in user
const urlsForUser = (id, database) => {
  let urls = {};
  for (let urlID of Object.keys(database)) {
    if (database[urlID].userID === id) {
      urls[urlID] = database[urlID];
    }
  }
  return urls;
};

const addUser = (email, password, db) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  db[id] = {
    id,
    email,
    password: hashedPassword
  };
  return id;
};



module.exports = {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
  urlsForUser,
  addUser
}