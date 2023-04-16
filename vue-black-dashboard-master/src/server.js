const express = require("express");
const app = express();
const jsonData = require("../src/jsonData");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/data", (req, res) => {
  const { page, itemsPerPage } = req.query;
  const start = (page - 1) * itemsPerPage;
  const end = start + parseInt(itemsPerPage);
  const dataChunk = jsonData.slice(start, end);
  res.json({ data: dataChunk, totalItems: jsonData.length });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
