const supertest = require("supertest");
const app = require("../lib/app");
const db = require("../lib/db");

describe("users", () => {
  beforeEach(async () => {
    await db.admin.clear();
  });

  it("list empty", async () => {
    // Return an empty user list by default
    const { body: users } = await supertest(app).get("/users").expect(200);
    users.should.eql([]);
  });

  it("list one element", async () => {
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

  it("add one element", async () => {
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
    // Check it was correctly inserted
    const { body: users } = await supertest(app).get("/users");
    users.length.should.eql(1);
  });

  it("get user", async () => {
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
});


