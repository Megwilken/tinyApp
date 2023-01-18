const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: req.session.user_id,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// renders URLs show page
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to continue!");
  } else {
    if (req.session.user_id) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: req.session.user_id,
      };
      res.render("urls_show", templateVars);
    }
  }
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("URL is invalid or does not exist - try again!");
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
        res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      user_id: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(400).send("Please login or register to shorten URLs!");
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// delete url
app.post("/urls/:id/delete", (req, res) => {
// if user is not logged in send error
  if (!req.session.user_id) {
    res.status(400).send("This url does not belong to you. Please login to continue!");
// If user logged in but doesn't own url send error

// if user is logged in delete
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to login");
  } else if (!getUserByEmail(email, users)) {
    res.status(403).send("No account exists. Please register!");
  } else if (!passwordChecker(password, users)) {
    res.status(403).send("Password incorrect. Try again or register for an account!");
  } else {
    req.session.user_id = users;
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const [password] = req.body.password;
  if (!email || ![password]) {
    res.status(400).send("Please enter your email and password to register");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
  } else {
    const newUser = generateRandomString();
    users[newUser] = {
      id: newUser,
      email: email,
      password: bcrypt.hashSync(password, 15),
    };
    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});

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