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
const urlsForUser = function(sessionID, urlDatabase) {
  const urls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === sessionID) {
      urls[id] = urlDatabase[id];
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
  urlsForUser
}