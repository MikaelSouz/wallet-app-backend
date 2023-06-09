const express = require("express");
const router = express.Router();
const db = require("../db");
const categoriesQueries = require("../queries/categories");
const usersQueries = require("../queries/users");
const financesQueries = require("../queries/finances");

router.post("/", async (req, res) => {
  try {
    const { category_id, title, date, value } = req.body;
    const { email } = req.headers;

    const userQuery = await db.query(usersQueries.findByEmail(email));

    if (!userQuery.rows[0]) {
      return res.status(404).json({ error: "User does not exists." });
    }

    const categoryQuery = await db.query(
      categoriesQueries.findById(category_id)
    );

    if (!categoryQuery.rows[0]) {
      return res.status(404).json({ error: "Category not found." });
    }

    if (!category_id) {
      return res.status(404).json({ error: "Category id is mandatory." });
    }

    if (!title || title.length < 3) {
      return res.status(400).json({
        error: "Title is mandatory and should have more than 3 characters.",
      });
    }

    if (!date || date.length != 10) {
      return res.status(400).json({
        error: "Date is mandatory and should be in the format yyyy-mm-dd.",
      });
    }

    if (!value || value === 0) {
      return res
        .status(400)
        .json({ error: "Value is mandatory and cannot be zero." });
    }

    const text =
      "INSERT INTO finances(user_id, category_id, date, title, value) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const values = [userQuery.rows[0].id, category_id, date, title, value];

    const createResponse = await db.query(text, values);

    if (!createResponse.rows[0]) {
      return res.status(400).json({ error: "Finance not created." });
    }

    return res.status(200).json(createResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.headers;

    if (!id) {
      return res.status(400).json({ error: "Param Id is mandatory." });
    }

    if (!email) {
      return res.status(400).json({ error: "User is mandatory." });
    }

    const user = await db.query(usersQueries.findByEmail(email));

    if (!user.rows[0]) {
      return res.status(404).json({ error: "User not found." });
    }

    const finance = await db.query(financesQueries.findById(id));

    if (!finance.rows[0]) {
      return res.status(404).json({ error: "Finance not found." });
    }

    if (finance.rows[0].user_id !== user.rows[0].id) {
      return res
        .status(401)
        .json({ error: "Finance row does not belong to user." });
    }

    const text = "DELETE FROM finances WHERE id = $1 RETURNING *";
    const values = [Number(id), user.rows[0].id];

    const deleteResponse = await db.query(text, values);

    if (!deleteResponse.rows[0]) {
      return res.status(400).json({ error: "Finance not delete." });
    }

    return res.status(200).json(deleteResponse.rows[0]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const { date } = req.query;
    const { email } = req.headers;

    if (!email) {
      return res.status(400).json({ error: "User is mandatory." });
    }

    const user = await db.query(usersQueries.findByEmail(email));

    if (!user.rows[0]) {
      return res.status(400).json({ error: "User does not exist." });
    }

    if (!date || date.length != 10) {
      return res.status(400).json({
        error: "Date is mandatory and should be in the format yyyy-mm-dd.",
      });
    }

    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth();

    const initDate = new Date(year, month, 1).toISOString();
    const finalDate = new Date(year, month + 1, 0).toISOString();

    const text =
      "SELECT  fn.title, fn.date, fn.value, fn.user_id, fn.category_id, ct.name FROM finances AS fn JOIN categories AS ct ON fn.category_id = ct.id WHERE user_id = $1 AND fn.date BETWEEN $2 AND $3 ORDER BY fn.date ASC";
    const values = [user.rows[0].id, initDate, finalDate];

    const getResponse = await db.query(text, values);

    return res.status(200).json(getResponse.rows);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
