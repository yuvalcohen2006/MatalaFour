const express = require("express");
const Soldier = require("../models/soldier");
const auth = require("../middleware/auth");

const router = new express.Router();
const statusCodes = {
  badRequest: 400,
  serverError: 500,
  created: 201,
  notFound: 404,
};
// ok
router.post("/login", async (req, res) => {
  try {
    const soldier = await Soldier.findByCredentials(
      req.body.email,
      req.body.password,
    );
    const name = soldier.name;
    const message = `Successfully logged in as ${name}`;
    const token = await soldier.generateAuthToken();
    res.send({ message, token });
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

// ok
router.post("/logout", auth, async (req, res) => {
  try {
    req.soldier.tokens = req.soldier.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.soldier.save();
    res.send("Logged out.");
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.post("/logoutAll", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  try {
    req.soldier.tokens = [];
    await req.soldier.save();
    res.send("Logged out.");
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.post("", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");

  const soldier = new Soldier(req.body);
  try {
    await soldier.save();
    const token = await soldier.generateAuthToken();
    res.status(statusCodes.created).send({ soldier, token });
  } catch (e) {
    res.status(statusCodes.serverError).send(e.message);
  }
});

// ok
router.get("/me", auth, async (req, res) => {
  res.send(req.soldier);
});

// ok
router.get("/name/:name", async (req, res) => {
  const _soldierName = req.params.name;
  try {
    const soldier = await Soldier.findOne({ name: _soldierName });
    res.send(soldier);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/nonLeaders", async (req, res) => {
  try {
    const soldiers = await Soldier.find({ isLeader: false }).map(
      (soldier) => soldier.name,
    );
    res.send(soldiers);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/tseirim", async (req, res) => {
  try {
    const baseDate = new Date();

    const oneYearFromNow = new Date(baseDate);
    oneYearFromNow.setFullYear(baseDate.getFullYear() + 1);

    const soldiers = await Soldier.find({
      recruitmentDate: { $gte: oneYearFromNow },
    });

    const splitFivesArray = [];
    for (let i = 0; i < soldiers.length; i += 5) {
      splitFivesArray.push(soldiers.slice(i, i + 5));
    }
    res.send(splitFivesArray);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/rankByPazam/:direction", async (req, res) => {
  try {
    const sortOrder = _direction === "ascending" ? 1 : -1;
    const soldiers = await Soldier.find({}).sort({
      recruitmentDate: sortOrder,
    });

    res.send(soldiers);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.get("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const soldier = await Soldier.findById(_id);
    if (!soldier) return res.status(statusCodes.notFound).send();
    res.send(soldier);
  } catch (e) {
    res.status(statusCodes.serverError).send(e);
  }
});

// ok
router.patch("/:id", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");

  const updates = Object.keys(req.body);
  const allowedUpdates = ["age", "team", "isLeader", "email"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation)
    return res.status(statusCodes.badRequest).send("Invalid update");
  const _id = req.params.id;

  try {
    const soldier = await Soldier.findById(_id);
    if (!soldier) return res.status(statusCodes.notFound).send();

    updates.forEach((update) => (soldier[update] = req.body[update]));

    res.send(soldier);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

// ok
router.delete("/me", auth, async (req, res) => {
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  try {
    await req.soldier.remove();
    res.send(req.soldier);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

// ok
router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!req.soldier.isLeader)
    res.send("You don't have permissions for this operation.");
  try {
    const soldier = await Soldier.findByIdAndDelete(_id);

    if (!soldier) return res.status(statusCodes.notFound).send();

    res.send(soldier);
  } catch (e) {
    res.status(statusCodes.badRequest).send(e);
  }
});

module.exports = router;
