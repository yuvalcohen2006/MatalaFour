const express = require("express");
const Team = require("../models/team");
const Soldier = require("../models/soldier");
const auth = require("../middleware/auth");
const router = new express.Router();
const statusCodes = {
  badRequest: 400,
  serverError: 500,
  created: 201,
  notFound: 404,
  ok: 200,
};

// ok
router.post("", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const team = new Team(req.body);

  try {
    await team.save();
    res.status(statusCodes.created).send(team);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

// ok
router.get("/biggestLeaders/:direction", async (req, res) => {
  try {
    const _direction = req.params.direction;
    const teams = await Team.find({});
    const soldiers = await Soldier.find({});

    const kvp = {};
    teams.forEach((team) => {
      kvp[team.name] = 0;
    });

    soldiers.forEach((soldier) => {
      const teamName = soldier.team;
      if (kvp.hasOwnProperty(teamName)) kvp[teamName] += 1;
    });

    const sortOrder = _direction === "ascending" ? 1 : -1;
    const sortedTeams = Object.entries(kvp).sort((a, b) => {
      return (a[1] - b[1]) * sortOrder;
    });

    const biggestLeaders = [];
    sortedTeams.forEach(([teamName]) => {
      const leader = soldiers.find((soldier) => {
        return soldier.isLeader === true && soldier.team === teamName;
      });
      biggestLeaders.push(leader);
    });
    res.send(biggestLeaders);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("", async (req, res) => {
  try {
    const teams = await Team.find({});
    res.send(teams);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const team = await Team.findById(_id);
    if (!team) return res.status(statusCodes.badRequest).send();
    res.send(team);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/name/:name", async (req, res) => {
  const _teamName = req.params.name;
  try {
    const leader = await Soldier.findOne({ isLeader: true, team: _teamName });
    res.send(leader);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/:name/size", async (req, res) => {
  const _teamName = req.params.name;
  try {
    const count = await Soldier.countDocuments({ team: _teamName });
    res.send({ size: count });
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.patch("teams/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation)
    return res.status(statusCodes.badRequest).send("Invalid update");
  const _id = req.params.id;
  try {
    const team = await Team.findById(_id);
    updates.forEach((update) => (team[update] = req.body[update]));

    if (!team) return res.status(statusCodes.notFound).send();

    res.send(team);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

// ok
router.delete("teams/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const _id = req.params.id;
  try {
    const team = await Team.findByIdAndDelete(_id);

    if (!team) return res.status(statusCodes.notFound).send();

    res.send(team);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

module.exports = router;
