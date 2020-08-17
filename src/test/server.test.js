/*

const requestPost = require('../server/server')
const validateRequest = requestPost.methodNameWhereCallsAreDefined;
const httpMocks = require('node-mocks-http');

describe("Testing the request post functionality", () => {
    test("Testing the getInfo() function", () => {
           expect(requestPost).toBeDefined();
})});
*/
const request = require("supertest");
const app = require("../server/server");

describe("Test the root path", () => {
    test("It should response the GET method", done => {
        request(app)
            .get("/")
            .then(response => {
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});

