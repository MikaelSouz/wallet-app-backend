const express = require("express");
const db = require("./db");
const routerCategories = require("./routes/categories");

const app = express();
app.use(express.json());

const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/categories", routerCategories);

app.listen(port, () => {
  db.connect()
    .then(() => {
      console.log("DB connected");
    })
    .catch((error) => {
      throw new Error(error);
    });
  console.log(`Example app listening on port ${port}`);
});
