const { merge } = require("mixme");
const level = require("level");
const db = level(__dirname + "/../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//db.clear();
module.exports = {
  channels: {
    delete: async (id) => {
      console.log(id);
      await db.del(`channels:${id}`);
      console.log("Successfully deleted.");
    },
    create: async (channel) => {
      if (!channel.name) throw Error("Invalid channel");
      await db.put(`channels:${channel.id}`, JSON.stringify(channel));
      return merge(channel, { id: channel.id });
    },
    get: async (id) => {
      if (!id) throw Error("Invalid id");
      const data = await db.get(`channels:${id}`);
      const channel = JSON.parse(data);
      return merge(channel, { id: id });
    },
    getByUser: async (user) => {
      return new Promise((resolve, reject) => {
        const channels = [];
        db.createReadStream({
          gt: "channels:",
          lte: "channels" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            channel = JSON.parse(value);
            channel.id = key.split(":")[1];
            if (user?.channelsList?.findIndex((x) => x === channel?.id) !== -1)
              channels.push(channel);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            resolve(channels);
          });
      });
    },
    list: async () => {
      return new Promise((resolve, reject) => {
        const channels = [];
        db.createReadStream({
          gt: "channels:",
          lte: "channels" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            channel = JSON.parse(value);
            channel.id = key.split(":")[1];
            channels.push(channel);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            resolve(channels);
          });
      });
    },
    update: async (id, channel) => {
      const original = await db.get(`channels:${id}`);
      if (!original) throw Error("Unregistered channel id");
      await db.del(`channels:${id}`);
      await db.put(`channels:${id}`, JSON.stringify(channel));
      return merge(channel, { id: channel.id });
    },
  },
  messages: {
    create: async (channelId, message) => {
      if (!channelId) throw Error("Invalid channel");
      if (!message.author) throw Error("Invalid message");
      if (!message.content) throw Error("Invalid message");
      await db.put(
        `messages:${channelId}:${message.id}`,
        JSON.stringify({
          id: message.id,
          author: message.author,
          content: message.content,
          creation: message.creation,
          media: message?.media,
        })
      );
      return merge(message, {
        channelId: channelId,
        id: message.id,
      });
    },
    delete: async (channelId, messageId) => {
      const originalFromDb = await db.get(`messages:${channelId}:${messageId}`);
      const original = JSON.parse(originalFromDb);
      console.log(original.author);
      if (!original) throw Error("Cannot find the message to delete.");
      await db.del(`messages:${channelId}:${messageId}`);
      await db.put(
        `messages:${channelId}:${messageId}`,
        JSON.stringify({
          id: messageId,
          reaction: null,
          author: original.author,
          content: "This message was deleted by the sender.",
          creation: original.creation,
          deleted: true,
          modified: null,
        })
      );
      return merge(original, {
        channelId: channelId,
        id: messageId,
        content: "This message was deleted by the sender.",
        deleted: true,
        reaction: null,
        modified: null,
      });
    },
    modify: async (channelId, messageId, content) => {
      const originalFromDb = await db.get(`messages:${channelId}:${messageId}`);
      const original = JSON.parse(originalFromDb);
      console.log(original.author);
      if (!original) throw Error("Cannot find the message to delete.");
      await db.del(`messages:${channelId}:${messageId}`);
      await db.put(
        `messages:${channelId}:${messageId}`,
        JSON.stringify({
          id: messageId,
          author: original.author,
          content: content,
          creation: original.creation,
          modified: true,
          reaction: original.reaction,
        })
      );
      return merge(original, {
        channelId: channelId,
        id: messageId,
        content: content,
        modified: true,
        reaction: original.reaction,
      });
    },
    addReaction: async (channelId, messageId, reactions) => {
      const originalFromDb = await db.get(`messages:${channelId}:${messageId}`);
      const original = JSON.parse(originalFromDb);
      console.log(original.author);
      if (!original) throw Error("Cannot find the message to delete.");
      await db.del(`messages:${channelId}:${messageId}`);
      var modified = false;
      if (original.modified) modified = true;
      else modified = false;
      await db.put(
        `messages:${channelId}:${messageId}`,
        JSON.stringify({
          id: messageId,
          author: original.author,
          content: original.content,
          creation: original.creation,
          reactions: reactions,
          modified: modified,
        })
      );
      return merge(original, {
        channelId: channelId,
        id: messageId,
        modified: modified,
        content: original.content,
        reactions: reactions,
      });
    },
    list: async (channelId) => {
      return new Promise((resolve, reject) => {
        const messages = [];
        db.createReadStream({
          gt: `messages:${channelId}:`,
          lte:
            `messages:${channelId}` +
            String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            message = JSON.parse(value);
            message.channelId = key.split(":")[1];
            messages.push(message);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            resolve(messages);
          });
      });
    },
  },
  users: {
    create: async (user) => {
      return new Promise((resolve, reject) => {
        if (!user.firstname) throw Error("Invalid user");
        const users = [];
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            const use = JSON.parse(value);
            use.id = key.split(":")[1];
            users.push(use);
          })
          .on("end", async () => {
            if (users.find((x) => x.email === user.email))
              resolve({
                create: false,
                message: "User already exists.",
              });
            else {
              await db.put(`users:${user.id}`, JSON.stringify(user));
              const id = user.id;
              const token = jwt.sign({ id }, "jwtSecret", {
                expiresIn: 300,
              });
              resolve({ create: true, token: token, user: user });
            }
          });
      });
    },
    get: async (id) => {
      if (!id) throw Error("Invalid id");
      const data = await db.get(`users:${id}`);
      const user = JSON.parse(data);
      return user;
    },
    getMembers: async (channelId) => {
      return new Promise((resolve, reject) => {
        const users = [];
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            user = JSON.parse(value);
            user.id = key.split(":")[1];
            if (user.channelsList?.findIndex((x) => x === channelId) !== -1)
              users.push(user);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            resolve(users);
          });
      });
    },
    getUserByEmail: async (email, user) => {
      return new Promise((resolve, reject) => {
        let finalUser = null;
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            const user = JSON.parse(value);
            user.id = key.split(":")[1];
            if (user.email === email) finalUser = user;
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", async () => {
            if (finalUser === null) {
              await db.put(`users:${user.id}`, JSON.stringify(user));
              resolve(user);
            } else resolve(finalUser);
          });
      });
    },
    getByEmail: async (email, user) => {
      return new Promise((resolve, reject) => {
        let finalUser = null;
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            const user = JSON.parse(value);
            user.id = key.split(":")[1];
            if (user.email === email) finalUser = user;
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", async () => {
            if (finalUser === null) {
              resolve({ failed: true, message: "Could not find account." });
            } else resolve(finalUser);
          });
      });
    },
    list: async () => {
      return new Promise((resolve, reject) => {
        const users = [];
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            user = JSON.parse(value);
            user.id = key.split(":")[1];
            users.push(user);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            resolve(users);
          });
      });
    },
    update: async (id, user) => {
      const original = await db.get(`users:${id}`);
      if (!original) throw Error("Unregistered user id");
      await db.del(`users:${id}`);
      await db.put(`users:${id}`, JSON.stringify(user));
      return merge(user, { id: user.id });
    },
    delete: async (id) => {
      console.log(id);
      const original = await db.del(`users:${id}`);
      console.log("Successfully deleted.");
    },
    login: (resp) => {
      return new Promise((resolve, reject) => {
        const users = [];
        db.createReadStream({
          gt: "users:",
          lte: "users" + String.fromCharCode(":".charCodeAt(0) + 1),
        })
          .on("data", ({ key, value }) => {
            user = JSON.parse(value);
            user.id = key.split(":")[1];
            users.push(user);
          })
          .on("error", (err) => {
            reject(err);
          })
          .on("end", () => {
            const user = users.find((u) => u.email === resp.email);
            if (!user) {
              resolve({ auth: false, message: "Could not find account" });
            }
            if (user && !bcrypt.compareSync(resp.password, user.password)) {
              resolve({ auth: false, message: "Password is incorect." });
            }
            if (user && bcrypt.compareSync(resp.password, user.password)) {
              const id = user.id;
              const token = jwt.sign({ id }, "jwtSecret", {
                expiresIn: 300,
              });
              resolve({ auth: true, token: token, user: user });
            }
          });
      });
    },
  },
  admin: {
    clear: async () => {
      await db.clear();
    },
  },
};
