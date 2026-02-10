require("dotenv").config();
const express = require("express");
require("./db/mongoose");

const soldierRouter = require("./routers/soldierRouter");
const teamRouter = require("./routers/teamRouter");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/soldiers", soldierRouter);
app.use("/teams", teamRouter);

app.listen(port, () => {
  console.log("server running");
});
