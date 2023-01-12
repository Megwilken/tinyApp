const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur";

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//GOOD - helper function
function generateRandomString() {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

//GOOD - helper function
function getUserByEmail(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

//GOOD - initial route
app.get("/", (req, res) => {
  //if logged in
  res.redirect("/urls");
  // } else {
  // res.redirect("/login")
  // };
});

//GOOD - main url page
app.get("/urls", (req, res) => {
  // IF NOT LOGGED IN, RETURN HTML ERROR MESSAGE
  // else {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
  };
  res.render("urls_index", templateVars);
  // };
});

//GOOD - create new URL page
// IF NOT LOGGED IN, REDIRECT TO LOGIN PAGE
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});

// GOOD - window after new URL is created
app.get("/urls/:id", (req, res) => {
  //- if a URL for the given ID does not exist returns HTML with a relevant error message
  // if user is not logged in returns HTML with a relevant error message
  // if user is logged it but does not own the URL with the given ID returns HTML with a relevant error message
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.session.user_id,
  };
  res.render("urls_show", templateVars);
});

// GOOD - redirect to website when clicking short URL link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//GOOD - create new URL
app.post("/urls", (req, res) => {
  //IF NOT LOGGED IN RETURN HTML ERROR MESSAGE
  // else {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
  // };
});

//GOOD - for edit url info - update database
app.post("/urls/:id", (req, res) => {
  //- if user is logged in and owns the URL for the given ID updates the URL AND redirects to `/urls`
  // if user is not logged in returns HTML with a relevant error message
  // if user is logged it but does not own the URL for the given ID returns HTML with a relevant error message
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

//GOOD - delete url
app.post("/urls/:id/delete", (req, res) => {
  //- if user is not logged in returns HTML with a relevant error message
  // if user is logged it but does not own the URL for the given ID returns HTML with a relevant error message
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//GOOD
app.get("/login", (req, res) => {
  const templateVars = {
    user: users,
    user: req.session.user_id,
  };
  res.render("login", templateVars);
});

//GOOD
app.post("/login", (req, res) => {
  const user_id = users[req.params.id];
  users = {
    email: req.body.email,
    password: req.body.password
  }
  req.session.user_id = users;
  res.redirect("/urls");
});

//GOOD
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  res.render("register", templateVars);
});

// GOOD
app.post("/register", (req, res) => {
  const email = req.body.email;
  if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
  } else {
    const newUser = generateRandomString();
    users[newUser] = {
      id: Date.now().toString(),
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = users[newUser];
    res.redirect("/urls");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//GOOD
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//GOOD
app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});
