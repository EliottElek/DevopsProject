const supertest = require("supertest");
const microtime = require("microtime");
const app = require("../lib/app");
const db = require("../lib/db");

describe("messages", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });

  it("should return empty list", async () => {
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

  it("should return one message", async () => {
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

  it("should add one message", async () => {
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
  it("should delete one message", async () => {
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

    //delete the message
    const { body: messageDeleted } = await supertest(app).delete(
      `/channels/${channel.id}/messages/${message.id}`
    );
    messageDeleted.should.match({
      id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
      author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
      content: "This message was deleted by the sender.",
      creation: new Date().toString(),
      channelId: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
      deleted: true,
      reaction: null,
      modified: null,
    });
  });
  it("should modify one message", async () => {
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

    //change content
    message.content = "New message modified !";
    //delete the message
    const { body: messageModified } = await supertest(app)
      .put(`/channels/${channel.id}/messages/${message.id}`)
      .send({ content: message.content });
    messageModified.should.match({
      id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
      author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
      content: "New message modified !",
      creation: new Date().toString(),
      channelId: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
      modified: true,
    });
  });
  it("should add a reaction to a message", async () => {
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

    //change content
    const reactions = ["✅", "😇"];
    //delete the message
    const { body: reactedMessage } = await supertest(app)
      .put(`/channels/${channel.id}/messages/${message.id}/react`)
      .send({ reactions: reactions });
    reactedMessage.should.match({
      id: "dzed3a217e-ac0d-4e16-836c-79458fef23dd",
      author: "dzed3a217e-ac0d-4e16-836c-79458fef23ddsddcx",
      content: "New message !",
      creation: new Date().toString(),
      channelId: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
      modified: false,
      reactions: ["✅", "😇"],
    });
  });
});
