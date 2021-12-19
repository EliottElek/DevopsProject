const users = [];
const avatars = require("./avatars");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcryptjs");
const coolImages = require("cool-images");
var randomName = require("random-firstname");

const eliott = {
  id: uuid(),
  firstname: "Eliott",
  lastname: "Morcillo",
  email: `eliott.morcillo@gmail.com`,
  password: bcrypt.hashSync("1234", bcrypt.genSaltSync()),
  channelsList: [],
  avatarUrl: "https://pbs.twimg.com/media/Emzyu36XEAE5vjh.jpg",
};
const paul = {
  id: uuid(),
  firstname: "Paul",
  lastname: "Gedda",
  email: `paul.gedda@gmail.com`,
  password: bcrypt.hashSync("1234", bcrypt.genSaltSync()),
  channelsList: [],
  avatarUrl:
    "https://dailymars-cdn-fra1.fra1.digitaloceanspaces.com/wp-content/uploads/2018/07/Incredibles-2-376x192.jpg",
};
for (let i = 0; i < 55; i++) {
  const firstname = randomName();
  const lastname = randomName();

  const user = {
    id: uuid(),
    firstname: firstname,
    lastname: lastname,
    email: `${firstname.toLowerCase()}.${lastname.toLowerCase()}@gmail.com`,
    password: bcrypt.hashSync("1234", bcrypt.genSaltSync()),
    channelsList: [],
    avatarUrl: coolImages.one(600, 800),
  };
  users.push(user);
}
//users.push(eliott);
users.push(paul);
module.exports = users;
