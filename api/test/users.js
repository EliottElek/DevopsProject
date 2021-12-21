const supertest = require("supertest");
const app = require("../lib/app");
const db = require("../lib/db");

describe("users", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });

  it("should return empty list", async () => {
    // Return an empty user list by default
    const { body: users } = await supertest(app).get("/users").expect(200);
    users.should.eql([]);
  });

  it("should return one user", async () => {
    // Create a user
    await supertest(app).post("/users").send({
      id: "ezezf23434-2343923-923edsdf2343",
      avatarUrl: "http://path-to-my-avatar",
      firstname: "Firstname",
      lastname: "Lastname",
      email: "test@test.com",
      password: "1234",
      channelsList: [],
    });
    // Ensure we list the users correctly
    const { body: users } = await supertest(app).get("/users").expect(200);
    users.should.match([
      {
        id: "ezezf23434-2343923-923edsdf2343",
        avatarUrl: "http://path-to-my-avatar",
        firstname: "Firstname",
        lastname: "Lastname",
        email: "test@test.com",
        password: "1234",
        channelsList: [],
      },
    ]);
  });

  it("should add one user", async () => {
    // Create a user
    const { body: user } = await supertest(app)
      .post("/users")
      .send({
        id: "ezezf23434-2343923-923edsdf2343",
        avatarUrl: "http://path-to-my-avatar",
        firstname: "Firstname",
        lastname: "Lastname",
        email: "test@test.com",
        password: "1234",
        channelsList: [],
      })
      .expect(201);
    // Check its return value
    // Check that it was correctly inserted
    const { body: users } = await supertest(app).get("/users");
    users.length.should.eql(1);
  });

  it("should return user by id", async () => {
    // Create a user
    const { body: data } = await supertest(app).post("/users").send({
      id: "ezezf23434-2343923-923edsdf2343",
      avatarUrl: "http://path-to-my-avatar",
      firstname: "Firstname",
      lastname: "Lastname",
      email: "test@test.com",
      password: "1234",
      channelsList: [],
    });
    // Check it was correctly inserted
    const { body: user } = await supertest(app)
      .get(`/users/${data.user.id}`)
      .expect(200);
    user.email.should.eql("test@test.com");
  });
  it("should return user by email", async () => {
    // Create a user
    const { body: data } = await supertest(app).post("/users").send({
      id: "ezezf23434-2343923-923edsdf2343",
      avatarUrl: "http://path-to-my-avatar",
      firstname: "Firstname",
      lastname: "Lastname",
      email: "test@test.com",
      password: "1234",
      channelsList: [],
    });
    // Check it was correctly inserted
    const { body: user } = await supertest(app)
      .post(`/users/email/${data.user.email}`)
      .expect(200);
    user.should.eql({
      id: "ezezf23434-2343923-923edsdf2343",
      avatarUrl: "http://path-to-my-avatar",
      firstname: "Firstname",
      lastname: "Lastname",
      email: "test@test.com",
      password: "1234",
      channelsList: [],
    });
  });

  it("should return correct members for a specific channel", async () => {
    // Create 5 users : 2 in the future channel, 3 not
    await supertest(app)
      .post("/users")
      .send({
        id: `id1`,
        avatarUrl: "http://path-to-my-avatar",
        firstname: `firstname1`,
        lastname: `lastname1`,
        email: "test@test.com",
        password: "1234",
        channelsList: ["idOfRequestedChannel", "otherid"],
      });
    await supertest(app)
      .post("/users")
      .send({
        id: `id2`,
        avatarUrl: "http://path-to-my-avatar",
        firstname: `firstname2`,
        lastname: `lastname2`,
        email: "test2@test.com",
        password: "1234",
        channelsList: ["idOfRequestedChannel", "otherid"],
      });
    await supertest(app)
      .post("/users")
      .send({
        id: `id3`,
        avatarUrl: "http://path-to-my-avatar",
        firstname: `firstname3`,
        lastname: `lastname3`,
        email: "test3@test.com",
        password: "1234",
        channelsList: ["otherid", "otherid2"],
      });
    await supertest(app)
      .post("/users")
      .send({
        id: `id4`,
        avatarUrl: "http://path-to-my-avatar",
        firstname: `firstname4`,
        lastname: `lastname4`,
        email: "test4@test.com",
        password: "1234",
        channelsList: ["otherid", "otherid2"],
      });
    await supertest(app)
      .post("/users")
      .send({
        id: `id5`,
        avatarUrl: "http://path-to-my-avatar",
        firstname: `firstname5`,
        lastname: `lastname5`,
        email: "test5@test.com",
        password: "1234",
        channelsList: ["idOfRequestedChannel", "otherid"],
      });

    //check number of users
    const { body: users } = await supertest(app).get("/users");
    users.length.should.eql(5);
    //insert one channel
    const { body: channel } = await supertest(app)
      .post("/channels")
      .send({
        private: true,
        admin: "dd3a217e-ac0d-4e16-836c-79458fef23dd",
        avatarUrl: "https://my-path-to-myavatar",
        name: "test",
        id: "idOfRequestedChannel",
        members: ["id1", "id2", "id5"],
      });
    //check members of the channel
    const { body: members } = await supertest(app).get(
      `/users/getmembers/${channel.id}`
    );
    members.length.should.equal(3);
  });
});
