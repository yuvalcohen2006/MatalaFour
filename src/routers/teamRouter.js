const express = require("express");
const Team = require("../models/team");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/teams", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const team = new Team({});

  try {
    await team.save();
    res.status(201).send(team);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/teams/biggestLeaders/:direction", async (req, res) => {
  try {
    const teams = await Team.find({});
    const _direction = req.params.direction.toLowerCase();
    if (_direction === "ascending") teams.sort((a, b) => a.size - b.size);
    else if (_direction === "descending") teams.sort((a, b) => b.size - a.size);

    const cleanArr = [];
    for (let i = 0; i < teams.length; i++) {
      cleanArr.push([{ Leader: teams[i].leader }, { TeamSize: teams[i].size }]);
    }
    res.send(cleanArr);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find({});
    res.send(teams);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/teams/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const team = await Team.findById(_id);
    if (!team) return res.status(400).send();
    res.send(team);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/teams/name/:name", async (req, res) => {
  const _teamName = req.params.name;
  try {
    const team = await Team.findOne({ name: _teamName });
    res.send(team.leader);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/teams/size/:name", async (req, res) => {
  const _teamName = req.params.name;
  try {
    const team = await Team.findOne({ name: _teamName });
    res.send(team.size);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("teams/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "leader", "size", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) return res.status(400).send("Invalid update");
  const _id = req.params.id;
  try {
    const team = await Team.findById(_id);
    updates.forEach((update) => (team[update] = req.body[update]));

    if (!team) return res.status(404).send();

    res.send(team);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("teams/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const _id = req.params.id;
  try {
    const team = await Team.findByIdAndDelete(_id);

    if (!team) return res.status(404).send();

    res.send(team);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
