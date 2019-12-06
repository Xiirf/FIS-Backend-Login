const request = require('supertest');
const app = require('../app');
const modelUser = require('../models/user-model');
const bcrypt = require('bcrypt');

describe('Test the root path', () => {
    test('It should response the GET method', () => {
        return request(app).get("/").then(response => {
            expect(response.statusCode).toBe(200)
        })
    });
});
describe('Test with 2 users mock', () => {
    let modelUserFind;
    let modelUserFindOne;
    let token;
    let modelUserSave;
    let modelUserPassword;
    let modelUserFindOneAndDelete;

    beforeAll((done) => {
        const user1 = new modelUser({ email: "email@Test1.fr", login: "loginTest1", password: "passwordTest1" });
        const user2 = new modelUser({ email: "email@Test2", login: "loginTest2", password: "passwordTest2" });
        let users = [user1, user2];

        modelUserPassword = jest.spyOn(modelUser.prototype, "isCorrectPassword");
        modelUserPassword.mockImplementation((s,f) => {
            f(null, true);
        })

        modelUserFindOneAndDelete = jest.spyOn(modelUser, "findOneAndDelete");
        modelUserFindOneAndDelete.mockImplementation((s,f) => {
            f(null, user1);
        })

        users.forEach((u) => {
            u.password = bcrypt.hashSync(u.password, 10);
        });
        modelUserFind = jest.spyOn(modelUser, "find");
        modelUserFind.mockImplementation((s,f) => {
            f(null, users);
        })

        modelUserFindOne = jest.spyOn(modelUser, "findOne");
        modelUserFindOne.mockImplementation((s,f) => {
            f(null, user1);
        })
        //Récupération du token
        request(app)
            .post('/api/v1/authenticate')
            .send({
                login: "loginTest1",
                password: "passwordTest1",
            })
            .end((err, response) => {
                token = response.body.token; // save the token!
                done();
            });
    });

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });
    

    describe('GET /users', () => {
        it('It should return all users', () => {
            return request(app)
                    .get("/api/v1/users")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 401 error (Authorization)', () => {
            return request(app)
                    .get("/api/v1/users")
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
            });
        });
    });
    describe('GET /user', () => {
        it('It should return 200', () => {
            return request(app)
                    .get("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 404', () => {
            return request(app)
                    .get("/api/v1/user/loginTest")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(404);
            });
        });
        it('It should return 401 error (Authorization)', () => {
            return request(app)
                    .get("/api/v1/users")
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
            });
        });
    });
    describe('POST /user', () => {
        it('It should return 400', () => {
            return request(app)
                    .post("/api/v1/user")
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
        modelUserSave = jest.spyOn(modelUser.prototype, "save");
        modelUserSave.mockImplementationOnce(() => Promise.resolve());
        it('It should return 201', () => {
            return request(app)
                    .post("/api/v1/user")
                    .send({
                        login: "loginTest1",
                        password: "passwordTest1",
                        email: "mail@mail.com"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(201);
            });
        });
        modelUserSave.mockImplementationOnce(() => Promise.reject());
        it('It should return 401', () => {
            return request(app)
                    .post("/api/v1/user")
                    .send({
                        login: "loginTest1",
                        password: "passwordTest1",
                        email: "mail@mail.com"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
            });
        });
    });
    describe('PUT /user', () => {
        it('It should return 400', () => {
            return request(app)
                    .put("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
        modelUserSave = jest.spyOn(modelUser.prototype, "save");
        modelUserSave.mockImplementationOnce(() => Promise.resolve());
        it('It should return 200', () => {
            return request(app)
                    .put("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        newEmail: "loginTest1",
                        newPassword: "passwordTest1"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        modelUserSave.mockImplementationOnce(() => Promise.reject());
        it('It should return 400', () => {
            return request(app)
                    .put("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        newEmail: "loginTest1",
                        newPassword: "passwordTest1"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
    });
    describe('POST /authenticate', () => {
        it('It should return 200', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .send({
                        login: "loginTest1",
                        password: "passwordTest1"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 400 (You must provide an user (password/login))', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
    });
    describe('DELETE /user', () => {
        it('It should return 200', () => {
            return request(app)
                    .delete("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
    });
    describe('POST /user/forgottenPassword', () => {
        it('It should return 200', () => {
            return request(app)
                    .post("/api/v1/user/forgottenPassword")
                    .send({
                        email: "email@Test1.fr"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 400', () => {
            return request(app)
                    .post("/api/v1/user/forgottenPassword")
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
    });
});