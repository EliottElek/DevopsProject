const supertest = require("supertest");
const app = require("../lib/app");
const db = require("../lib/db");

describe("channels", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });

  describe("list", () => {
    it("list empty", async () => {
      // Return an empty channel list by default
      const { body: channels } = await supertest(app)
        .get("/channels")
        .expect(200);
      channels.should.eql([]);
    });

    it("list one element", async () => {
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
  });
  it("create one element", async () => {
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

  it("get channel", async () => {
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
});
