const supertest = require("supertest");
const microtime = require("microtime");
const app = require("../lib/app");
const db = require("../lib/db");

describe("messages", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });

  it("list empty", async () => {
    // Create a channel
    const { body: channel } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3a217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar",
        name: "test",
        id: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "dd3a217e-ac0d-4e16-836c-79458fdsdf23dd",
          "dd3a217esdsd-ac0d-4e16-836c-79458fef23dd",
        ],
      });
    // Get messages
    const { body: messages } = await supertest(app)
      .get(`/channels/${channel.id}/messages`)
      .expect(200);
    messages.should.eql([]);
  });

  it("list one message", async () => {
    // Create a channel
    const { body: channel } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3a217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar",
        name: "test",
        id: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "dd3a217e-ac0d-4e16-836c-79458fdsdf23dd",
          "dd3a217esdsd-ac0d-4e16-836c-79458fef23dd",
        ],
      });
    // and a message inside it
    await supertest(app).post(`/channels/${channel.id}/messages`).send({
      id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
      channelId: channel.id,
      content: "New message !",
      author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
      creation: new Date().toString(),
    });
    // Get messages
    const { body: messages } = await supertest(app)
      .get(`/channels/${channel.id}/messages`)
      .expect(200);
    messages.should.match([
      {
        id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
        channelId: channel.id,
        content: "New message !",
        author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
        creation: new Date().toString(),
      },
    ]);
  });

  it("add one element", async () => {
    // Create a channel
    const { body: channel } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3a217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar",
        name: "test",
        id: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "dd3a217e-ac0d-4e16-836c-79458fdsdf23dd",
          "dd3a217esdsd-ac0d-4e16-836c-79458fef23dd",
        ],
      });
    // Create a message inside it
    const { body: message } = await supertest(app)
      .post(`/channels/${channel.id}/messages`)
      .send({
        id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
        channelId: channel.id,
        content: "New message !",
        author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
        creation: new Date().toString(),
      })
      .expect(201);
    message.should.match({
      id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
      channelId: channel.id,
      content: "New message !",
      author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
      creation: new Date().toString(),
    });
    // Check it was correctly inserted
    const { body: messages } = await supertest(app).get(
      `/channels/${channel.id}/messages`
    );
    messages.length.should.eql(1);
  });
});
