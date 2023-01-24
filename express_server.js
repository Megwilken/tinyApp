const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
  addUser,
  urlsForUser,
} = require("./helperFunctions");
const { urlDatabase, users } = require("./database/database.js")

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true, }));
app.set("view engine", "ejs");
app.use(
  cookieSession({ 
    name: "session",
    keys: ["user_id"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// INITIAL ROUTE
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// MAIN URL PAGE
app.get("/urls", (req, res) => {
if (!req.session.user_id) {
  res.redirect("login")
} else {
  console.log(users)
  console.log(req.session.user_id)
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user_id: req.session.user_id,
    user: req.session.user_id,
    email: users[req.session.user_id].email
  };
  res.render("urls_index", templateVars);
}
});

// CREATE NEW URLS
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: req.session.user_id,
      user: req.session.user_id,
      email: users[req.session.user_id].email
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// TINY URLS PAGE 
app.get("/urls/:id", (req, res) => {
    if (urlDatabase[req.params.id])   {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user_id: urlDatabase[req.params.id].userID,
        user: req.session.user_id,
        email: users[req.session.user_id].email
      };
      res.render("urls_show", templateVars);
    } else {
        res.send("You do not own this URL");
  };
});

// REDIRECT TINY URLS
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("URL is invalid or does not exist - try again!");
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
        res.redirect(longURL);
  }
});

// CREATE TINY URLS
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.send("Please login or register to shorten URLs!");
  }
});

// EDIT TINY URLS
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const userUrls = urlsForUser(user_id, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const id = req.params.id;
    urlDatabase[id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send("You do not have authorization to edit this short URL.");
  }
});

// DELETE URL FROM DATABASE
app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const userUrls = urlsForUser(user_id, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const id = req.params.id;
    delete urlDatabase[id];
    res.redirect('/urls');
     } else {
    res.send("This url does not belong to you!");
  }
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  }
});

// SUBMIT LOGIN
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users)
  if (!req.body.email || !req.body.password) {
    res.send("Please enter your email and password to login");
  } else if (!getUserByEmail(email, users)) {
    res.send("No account exists. Please register!");
  } else if (!passwordChecker(password, users)) {
    res.send("Password incorrect. Try again or register for an account!");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// REGISTRATION PAGE
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      user: users[req.session.user_id],
    };
    res.render("register", templateVars);
  }
});

// SUBMIT REGISTRATION
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please enter your email and password to register");
  } else if (getUserByEmail(email, users)) {
    res.send("An account already exists. Please login!");
  } else {
    const user_id = addUser(email, password, users);
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

// LOGOUT AND CLEAR COOKIES
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});