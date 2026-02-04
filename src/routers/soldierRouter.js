const express = require("express");
const Soldier = require("../models/soldier");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/soldiers/login", async (req, res) => {
  try {
    const soldier = await Soldier.findByCredentials(
      req.body.email,
      req.body.password,
    );
    const message = "Successfully logged in as " + soldier.name;
    const token = await soldier.generateAuthToken();
    res.send({ message, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/soldiers/logout", auth, async (req, res) => {
  try {
    req.soldier.tokens = req.soldier.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.soldier.save();
    res.send("Logged out.");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/soldiers/logoutAll", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  try {
    req.soldier.tokens = [];
    await req.soldier.save();
    res.send("Logged out all users.");
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/soldiers", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");

  const soldier = new Soldier(req.body);
  try {
    await soldier.save();
    const token = await soldier.generateAuthToken();
    res.status(201).send({ soldier, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get("/soldiers/me", auth, async (req, res) => {
  res.send(req.soldier);
});

router.get("/soldiers/name/:name", async (req, res) => {
  const _soldierName = req.params.name;
  try {
    const soldier = await Soldier.findOne({ name: _soldierName });
    res.send(soldier.team);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/soldiers/nonLeaders", async (req, res) => {
  try {
    const soldiers = await Soldier.find({});
    const notLeaders = soldiers
      .filter((soldier) => !soldier.isLeader)
      .map((soldier) => soldier.name);
    res.send(notLeaders);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/soldiers/tseirim", async (req, res) => {
  try {
    const soldiers = await Soldier.find({});
    const tseirim = soldiers.filter((soldier) => soldier.pazamInMonths < 12);
    const splitFivesArray = [];
    for (let i = 0; i < tseirim.length; i += 5) {
      splitFivesArray.push(tseirim.slice(i, i + 5));
    }
    res.send(splitFivesArray);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/soldiers/rankByPazam/:direction", async (req, res) => {
  try {
    const soldiers = await Soldier.find({});
    const _direction = req.params.direction.toLowerCase();

    if (_direction === "ascending")
      soldiers.sort((a, b) => a.pazamInMonths - b.pazamInMonths);
    else if (_direction === "descending")
      soldiers.sort((a, b) => b.pazamInMonths - a.pazamInMonths);

    res.send(soldiers);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/soldiers/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const soldier = await Soldier.findById(_id);
    if (!soldier) return res.status(400).send();
    res.send(soldier);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/soldiers/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "team", "pazamInMonths", "isLeader"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) return res.status(400).send("Invalid update");
  const _id = req.params.id;
  try {
    const soldier = await Soldier.findById(_id);
    updates.forEach((update) => (soldier[update] = req.body[update]));

    if (!soldier) return res.status(404).send();

    res.send(soldier);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/soldiers/me", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  try {
    await req.soldier.remove();
    res.send(req.soldier);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/soldiers/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const soldier = await Soldier.findByIdAndDelete(_id);

    if (!soldier) return res.status(404).send();

    res.send(soldier);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
