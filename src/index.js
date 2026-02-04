const express = require("express");
require("./db/mongoose");

const soldierRouter = require("./routers/soldierRouter");
const teamRouter = require("./routers/teamRouter");
const Team = require("./models/team");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(soldierRouter);
app.use(teamRouter);

app.listen(port, () => {
  console.log("server running");
});
