const supertest = require("supertest");
const app = require("../lib/app");
const db = require("../lib/db");

describe("channels", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });
  it("sould return empty list", async () => {
    // Return an empty channel list by default
    const { body: channels } = await supertest(app)
      .get("/channels")
      .expect(200);
    channels.should.eql([]);
  });

  it("should return one channel", async () => {
    // Create a channel
    await supertest(app)
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
    // Ensure we list the channels correctly
    const { body: channels } = await supertest(app)
      .get("/channels")
      .expect(200);
    channels.should.match([
      {
        private: true,
        admin: "dd3a217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar",
        name: "test",
        id: "dd3asddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "dd3a217e-ac0d-4e16-836c-79458fdsdf23dd",
          "dd3a217esdsd-ac0d-4e16-836c-79458fef23dd",
        ],
      },
    ]);
  });
  it("should create one channel", async () => {
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
      })
      .expect(201);
    // Check its return value
    channel.should.match({
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
    // Check it was correctly inserted
    const { body: channels } = await supertest(app).get("/channels");
    channels.length.should.eql(1);
  });

  it("should get one channel", async () => {
    // Create a channel
    const { body: channel1 } = await supertest(app)
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
    // Check it was correctly inserted
    const { body: channel } = await supertest(app)
      .get(`/channels/${channel1.id}`)
      .expect(200);
    channel.name.should.eql("test");
  });
  it("should delete one channel", async () => {
    // Create a channel
    const { body: channel1 } = await supertest(app)
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
    const { body: channel2 } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3vca217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar2",
        name: "test2",
        id: "dd3assddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "ddwx3a217e-ac0xwxd-4e16-836c-79458fdsdf23dd",
          "ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd",
          "ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd",
        ],
      });
    // Check it was correctly inserted
    const { body: channelres1 } = await supertest(app)
      .get(`/channels/${channel1.id}`)
      .expect(200);
    channelres1.name.should.eql("test");
    const { body: channelres2 } = await supertest(app)
      .get(`/channels/${channel2.id}`)
      .expect(200);
    channelres2.name.should.eql("test2");

    //delete channel 1
    const { body: response } = await supertest(app)
      .delete(`/channels/${channel1.id}`)
      .expect(201);
    response.message.should.equal("Channel successfully deleted.");
    //check if list has been decremented
    const { body: channels } = await supertest(app)
      .get("/channels")
      .expect(200);
    channels.length.should.eql(1);
  });
  it("should get channels for a specific user", async () => {
    //Step 1 : create a user
    const { body: data } = await supertest(app)
      .post("/users")
      .send({
        id: "ezezf23434-2343923-923edsdf2343",
        avatarUrl: "http://path-to-my-avatar",
        firstname: "Firstname",
        lastname: "Lastname",
        email: "test@test.com",
        password: "1234",
        channelsList: ["id1", "id2", "id5"],
      });
    // Check it was correctly inserted
    const { body: user } = await supertest(app)
      .get(`/users/${data.user.id}`)
      .expect(200);
    user.email.should.eql("test@test.com");

    //create 15 channels
    for (let i = 0; i < 15; i++) {
      await supertest(app)
        .post("/channels")
        .send({
          private: true,
          admin: `dd3vca217e-ac0d-4e16-ssds836c-79458fef23dd${i}`,
          avatarUrl: "https://my-path-to-myavatar2",
          name: `Channel${i}`,
          id: `id${i}`,
          members: [
            `ezezf23434-2343923-923edsdf2343`,
            `ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd${i}`,
            `ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd${i}`,
          ],
        });
    }
    //   //check if all 15 have been inserted
    const { body: channels } = await supertest(app)
      .get("/channels")
      .expect(200);
    channels.length.should.eql(15);

    //finally, get all channels from user
    const { body: channelsFound } = await supertest(app)
      .post("/channels/find")
      .send({ user: user })
      .expect(200);
    channelsFound.length.should.eql(3);

    channelsFound.should.match([
      {
        private: true,
        admin: "dd3vca217e-ac0d-4e16-ssds836c-79458fef23dd1",
        avatarUrl: "https://my-path-to-myavatar2",
        name: "Channel1",
        id: `id1`,
        members: [
          `ezezf23434-2343923-923edsdf2343`,
          `ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd1`,
          `ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd1`,
        ],
      },
      {
        private: true,
        admin: "dd3vca217e-ac0d-4e16-ssds836c-79458fef23dd2",
        avatarUrl: "https://my-path-to-myavatar2",
        name: "Channel2",
        id: `id2`,
        members: [
          `ezezf23434-2343923-923edsdf2343`,
          `ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd2`,
          `ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd2`,
        ],
      },
      {
        private: true,
        admin: "dd3vca217e-ac0d-4e16-ssds836c-79458fef23dd5",
        avatarUrl: "https://my-path-to-myavatar2",
        name: "Channel5",
        id: `id5`,
        members: [
          `ezezf23434-2343923-923edsdf2343`,
          `ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd5`,
          `ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd5`,
        ],
      },
    ]);
  });
  it("should modify a channel", async () => {
    const { body: channel1 } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3vca217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar2",
        name: "Channel1",
        id: "dd3assddsq217e-ac0d-4e16-836c-79458fef23dd",
        members: [
          "ddwx3a217e-ac0xwxd-4e16-836c-79458fdsdf23dd",
          "ddwx3a217esdsd-ac0d-4e16-836c-79458fef23dd",
          "ddwx3a217esdsd-ac0d-s4e16-83sd6c-79458fef23dd",
        ],
      });
    // Check it was correctly inserted
    const { body: channelres1 } = await supertest(app)
      .get(`/channels/${channel1.id}`)
      .expect(200);
    channelres1.name.should.eql("Channel1");

    //Modify the channel 
    channelres1.name = "Channel1Modified";
    const { body: modifiedChannel } = await supertest(app)
    .put(`/channels/${channelres1.id}`).send({channel : channelres1})
    .expect(200);
    modifiedChannel.name.should.eql("Channel1Modified");
  });
});
