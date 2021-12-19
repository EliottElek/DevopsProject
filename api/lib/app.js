const db = require("./db");
const express = require("express");
const cors = require("cors");
const app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

const authenticator = require("./authenticator");
const authenticate = authenticator({
  test_payload_email: process.env["TEST_PAYLOAD_EMAIL"],
  jwks_uri: "http://127.0.0.1:5556/dex/keys",
});

app.use(require("body-parser").json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(["app-side chat application."].join(""));
});

// Channels

// app.get("/channels", authenticate, async (req, res) => {
//   const channels = await db.channels.list();
//   res.json(channels);
// });
app.get("/channels", async (req, res) => {
  const channels = await db.channels.list();
  res.json(channels);
});
app.post("/channels", async (req, res) => {
  const channel = await db.channels.create(req.body);
  res.status(201).json(channel);
});
app.delete("/channels/:id", async (req, res) => {
  await db.channels.delete(req.params.id);
  res.status(201).json({ message: "Channel successfully deleted." });
});
app.get("/channels/:id", async (req, res) => {
  const channel = await db.channels.get(req.params.id);
  res.json(channel);
});
app.post("/channels/find/", async (req, res) => {
  const channel = await db.channels.getByUser(req.body.user);
  res.json(channel);
});
app.put("/channels/:id", async (req, res) => {
  const channel = await db.channels.update(req.params.id, req.body.channel);
  res.json(channel);
});

// Messages

app.get("/channels/:id/messages", async (req, res) => {
  const messages = await db.messages.list(req.params.id);
  res.json(messages);
});

app.post("/channels/:id/messages", async (req, res) => {
  const message = await db.messages.create(req.params.id, req.body);
  res.status(201).json(message);
});
app.delete("/channels/:id/messages/:id2", async (req, res) => {
  const message = await db.messages.delete(req.params.id, req.params.id2);
  res.status(201).json(message);
});
app.put("/channels/:id/messages/:id2", async (req, res) => {
  const message = await db.messages.modify(
    req.params.id,
    req.params.id2,
    req.body.content
  );
  console.log(req.body.content);
  res.status(201).json(message);
});
app.put("/channels/:id/messages/:id2/react", async (req, res) => {
  const message = await db.messages.addReaction(
    req.params.id,
    req.params.id2,
    req.body.reactions
  );
  res.status(201).json(message);
});
// Users

app.get("/users", async (req, res) => {
  const users = await db.users.list();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const user = await db.users.create(req.body);
  res.status(201).json(user);
});

app.post("/users/email/:email", async (req, res) => {
  const user = await db.users.getUserByEmail(req.params.email, req.body.user);
  res.json(user);
});
app.get("/users/email/:email", async (req, res) => {
  const user = await db.users.getByEmail(req.params.email);
  res.json(user);
});
app.get("/users/:id", async (req, res) => {
  const user = await db.users.get(req.params.id);
  res.status(200).json(user);
});
app.get("/users/getmembers/:channelId", async (req, res) => {
  const members = await db.users.getMembers(req.params.channelId);
  res.json(members);
});
app.put("/users/:id", async (req, res) => {
  const user = await db.users.update(req.params.id, req.body.user);
  console.log(req.body);
  res.json(user);
});
app.delete("/users/:id", async (req, res) => {
  await db.users.delete(req.params.id);
  res.status(201).json({ message: "User successfully deleted." });
});
//login
app.post("/login", async (req, res) => {
  const response = await db.users.login(req.body);
  res.json(response);
});

module.exports = app;
