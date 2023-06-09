const express = require("express");
const router = express.Router();
const db = require("../db");
const usersQueries = require("../queries/users");

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (name.length < 3) {
      return res
        .status(400)
        .json({ error: "Name should have more than 3 characters." });
    }

    if (name.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail is invalid." });
    }

    const query = usersQueries.findByEmail(email);
    const alreadyExists = await db.query(query);

    if (alreadyExists.rows[0]) {
      return res.status(403).json({ error: "Email already registered" });
    }

    const text = "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *";
    const values = [name, email];

    const createResponse = await db.query(text, values);

    if (!createResponse.rows[0]) {
      return res.status(400).json({ error: "User not created" });
    }

    return res.status(200).json(createResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.put("/", async (req, res) => {
  try {
    const { email_current } = req.headers;
    const { name, email } = req.body;

    const query = usersQueries.findByEmail(email_current);
    const alreadyExists = await db.query(query);

    if (!alreadyExists.rows[0]) {
      return res.status(404).json({ error: "User does not exist." });
    }

    if (name.length < 3) {
      return res
        .status(400)
        .json({ error: "Name should have more than 3 characters." });
    }

    if (email.length < 5 || !email.includes("@")) {
      return res.status(400).json({ error: "Email is invalid." });
    }

    const text =
      "UPDATE users SET name=$1, email=$2 WHERE email=$3 RETURNING *";
    const values = [name, email, email_current];

    const updateResponse = await db.query(text, values);

    return res.status(200).json(updateResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
