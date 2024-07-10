const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbase;

function handleDisconnect() {
  dbase = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'salam123', 
    database: 'app' 
  });

  dbase.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000); 
    } else {
      console.log('Connected to MySQL');
    }
  });

  dbase.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); 
    } else {
      throw err;
    }
  });
}

handleDisconnect();

app.get("/", (req, res) => {
  res.send("<a>you can find information from db in /users </a>");
});

app.get("/users", (req, res) => {
  dbase.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send(results);
  });
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  dbase.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.status(200).send(results[0]);
    } else {
      res.status(404).send({
        status: 404,
        message: "No such user",
      });
    }
  });
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", (req, res) => {
  const { id, name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send({ message: "Name and email are required" });
  }

  dbase.query('INSERT INTO users (id, username, email) VALUES (?, ?, ?)', [id, name, email], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/users");
  });
});

app.get("/delete/:id", (req, res) => {
  const { id } = req.params;
  dbase.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.render("delete", { user: results[0] });
    } else {
      res.status(404).send({
        status: 404,
        message: "No such user",
      });
    }
  });
});

app.post("/delete/:id", (req, res) => {
  const { id } = req.params;
  dbase.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/");
  });
});

app.get("/insert", (req, res) => {
  res.render("insert");
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send({ message: "Name and email are required" });
  }

  dbase.query('INSERT INTO users (username, email) VALUES (?, ?)', [name, email], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/");
  });
});

app.get("/update/:id", (req, res) => {
  const { id } = req.params;
  dbase.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.render("update", { user: results[0] });
    } else {
      res.status(404).send({
        status: 404,
        message: "No such user",
      });
    }
  });
});

app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send({ message: "Name and email are required" });
  }

  dbase.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [name, email, id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/");
  });
});

app.get("/replace/:id", (req, res) => {
  const { id } = req.params;
  dbase.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.render("replace", { user: results[0] });
    } else {
      res.status(404).send({
        status: 404,
        message: "No such user",
      });
    }
  });
});

app.post("/replace/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send({ message: "Name and email are required" });
  }

  dbase.query('REPLACE INTO users SET id = ?, username = ?, email = ?', [id, name, email], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
