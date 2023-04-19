const request = require("supertest");
const app = require("../app");

describe("Test the root path", () => {
    test("It should response the GET method", () => {
        return request(app).get("/").expect(302);
    });
});

describe("Test the login path", () => {
    test("It should response the GET method", () => {
        return request(app).get("/login").expect(200);
    });
});

describe("Test the game menu", () => {
    test("It should response the GET method", () => {
        return request(app).get("/game-menu").expect(200);
    });
});

describe("Test the game area", () => {
    test("It should response the GET method", () => {
        return request(app).get("/gameArea").expect(200);
    });
});
