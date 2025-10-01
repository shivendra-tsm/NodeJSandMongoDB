const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const User = require("../models/userModel");
const Blog = require("../models/blogModel");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Blog.deleteMany();
  await User.deleteMany();
});

// ------------------- HELLO API -------------------
describe("Hello API", () => {
  it("GET /api/user/hello - should return Hello World", async () => {
    const res = await request(app).get("/api/user/hello");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Hello World");
  });
});

// ------------------- USER AUTH -------------------
describe("User API", () => {
  it("POST /api/user/register - should register a user", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({ name: "TestUser", email: "test@test.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Registration successfull");
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/user/register - fail if missing fields", async () => {
    const res = await request(app)
      .post("/api/user/register")
      .send({ name: "TestUser" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  it("POST /api/user/register - fail if email exists", async () => {
    await request(app)
      .post("/api/user/register")
      .send({ name: "User1", email: "test@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/user/register")
      .send({ name: "User2", email: "test@test.com", password: "password123" });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("This email already exist");
  });

  it("POST /api/user/login - should login a user", async () => {
    await request(app)
      .post("/api/user/register")
      .send({ name: "LoginUser", email: "login@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "login@test.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/user/login - fail with wrong password", async () => {
    await request(app)
      .post("/api/user/register")
      .send({ name: "LoginUser", email: "login@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "login@test.com", password: "wrongpass" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email or password");
  });

  it("POST /api/user/login - fail with unregistered email", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "unknown@test.com", password: "password123" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No user found");
  });

  it("POST /api/user/login - fail with missing fields", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ email: "login@test.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });
});

// ------------------- BLOG API -------------------
describe("Blog API", () => {
  let token;
  let userId;
  let otherToken;
  let otherId;
  let blogId;

  beforeEach(async () => {
    const user = await User.create({ name: "BlogUser", email: "blog@test.com", password: "password123" });
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret");

    const other = await User.create({ name: "OtherUser", email: "other@test.com", password: "password123" });
    otherId = other._id;
    otherToken = jwt.sign({ id: other._id }, process.env.JWT_SECRET || "secret");

    const blog = await Blog.create({ title: "Initial Blog", content: "Initial Content", author: userId });
    blogId = blog._id;
  });

  // ----------------- POST /create blog -----------------
  it("POST /api/user/saveblog - create blog with image", async () => {
    const res = await request(app)
      .post("/api/user/saveblog")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "New Blog")
      .field("content", "Content here")
      .attach("img", path.join(__dirname, "../uploads/1759239229493.png"));

    expect(res.statusCode).toBe(201);
    expect(res.body.blog.title).toBe("New Blog");
  });

  it("POST /api/user/saveblog - fail without token", async () => {
    const res = await request(app)
      .post("/api/user/saveblog")
      .send({ title: "NoAuth", content: "Content" });

    expect(res.statusCode).toBe(401);
  });

  // ----------------- GET /getblogs -----------------

  it("GET /api/user/getblogs - should fetch all blogs with author populated", async () => {
    const res = await request(app)
      .get("/api/user/getblogs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].author.name).toBe("BlogUser");
    expect(res.body.data[0].title).toBe("Initial Blog");
  });

  it("GET /api/user/getblogs - fail if no blogs exist", async () => {
    await Blog.deleteMany();
    const res = await request(app)
      .get("/api/user/getblogs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No blog found");
  });

  // ----------------- GET /getblogbyid -----------------
  it("GET /api/user/getblogbyid - fetch blogs of logged-in user only", async () => {
    await Blog.create({ title: "Other Blog", content: "Other content", author: otherId });

    const res = await request(app)
      .get("/api/user/getblogbyid")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].author).toBe(userId.toString());
  });

  it("GET /api/user/getblogbyid - fail if user has no blogs", async () => {
    await Blog.deleteMany({ author: userId });
    const res = await request(app)
      .get("/api/user/getblogbyid")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No blogs found");
  });

  // ----------------- UPDATE /updateblog/:id -----------------
  it("PUT /api/user/updateblog/:id - should update title and content", async () => {
    const res = await request(app)
      .put(`/api/user/updateblog/${blogId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated Title")
      .field("content", "Updated Content");

    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
    expect(res.body.data.content).toBe("Updated Content");
  });

  it("PUT /api/user/updateblog/:id - should update blog image and delete old image", async () => {
    const blog = await Blog.findById(blogId);
    blog.imgUrl = "old-image.jpg";
    await blog.save();

    fs.writeFileSync(path.join(__dirname, "../uploads/old-image.jpg"), "dummy");

    const res = await request(app)
      .put(`/api/user/updateblog/${blogId}`)
      .set("Authorization", `Bearer ${token}`)
      .attach("img", path.join(__dirname, "../uploads/1759239229493.png"));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.imgUrl).not.toBe("old-image.jpg");

    expect(fs.existsSync(path.join(__dirname, "../uploads/old-image.jpg"))).toBe(false);
  });

  it("PUT /api/user/updateblog/:id - fail if not owner", async () => {
    const res = await request(app)
      .put(`/api/user/updateblog/${blogId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .field("title", "Hacked");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid access");
  });

  it("PUT /api/user/updateblog/:id - fail if blog does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/user/updateblog/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Updated");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No blog found");
  });

  // ----------------- DELETE /deleteblog/:id -----------------
  it("DELETE /api/user/deleteblog/:id - should delete blog by owner", async () => {
    const res = await request(app)
      .delete(`/api/user/deleteblog/${blogId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("blog deleted");
    const blog = await Blog.findById(blogId);
    expect(blog).toBeNull();
  });

  it("DELETE /api/user/deleteblog/:id - fail if not owner", async () => {
    const res = await request(app)
      .delete(`/api/user/deleteblog/${blogId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid access");
  });

  it("DELETE /api/user/deleteblog/:id - fail if blog not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/user/deleteblog/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No blog found");
  });
});