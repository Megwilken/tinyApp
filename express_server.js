const express = require("express");
const cookieSession = require("cookie-session")
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; 

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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

//good - helper function
function generateRandomString() {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getUserByEmail(email, userDatabase) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
}

//GOOD - initial route
app.get("/", (req, res) => {
  //if logged in
  res.redirect("/urls");
  //iff not logged in
  // res.redirect("/login")
});

//GOOD - main url page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.session.user_id
   };
  res.render("urls_index", templateVars);
});

//GOOD - create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

// GOOD - window after new URL is created
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.session.user_id,
  };
  res.render("urls_show", templateVars);
});

// GOOD - redirect to website when clicking short URL link
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//GOOD - create new URL
app.post("/urls", (req, res) => {
  const id = generateRandomString(); 
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

//GOOD - for edit url info - update database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

//GOOD - delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
  };
  res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  res.cookie("user_id");
  res.redirect("/urls");
});

// FIX
app.post("/register", (req, res) => {
  const email = req.body.email;
 if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
  } else {
    newUser = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    users.push = {
      id: Date.now().toString(),
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("user_id");
    res.redirect("/login");
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//good
app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});
