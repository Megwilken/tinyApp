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

// helper function - adds user to database
const addUser = (email, password, users) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  return id;
};

const urlsForUser = function(user_id, urlDatabase) {
  const userUrls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === user_id) {
      userUrls[id] = urlDatabase[id];
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  addUser,
  urlsForUser,
}