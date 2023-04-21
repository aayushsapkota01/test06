const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
const bcrypt = require("bcrypt");
const HTTP_PORT = process.env.PORT || 8081;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Register handlerbars as the rendering engine for views
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

// Setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static("static"));

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
// Setup a route on the 'root' of the url to redirect to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// Display the login html page
app.get("/login", function (req, res) {
  res.render("login", { layout: false });
});

// The login route that adds the user to the session
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    // Render 'missing credentials'
    return res.render("login", {
      layout: false,
    });
  } else {
    bcrypt.hash(password, 1, (err, hash) => {
      if (err) {
        console.error("Server Error");
      }
      // Pass the username and hashed password as query parameters
      res.redirect(`/dashboard?username=${username}&password=${hash}`);
    });
  }
});

// Log a user out by destroying their session
// and redirecting them to /login
app.get("/logout", function (req, res) {
  req.session.reset();
  res.redirect("/login");
});

app.get("/dashboard", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  res.render("dashboard", {
    username: username,
    password: password,
    layout: false,
  });
});

app.listen(HTTP_PORT, onHttpStart);
