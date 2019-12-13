const request = require('supertest');
const app = require('../app');
const db = require('../db');

const apiPort = (process.env.PORT || 6201);

describe('Test the root path', () => {
    test('It should response the GET method', () => {
        return request(app).get("/").then(response => {
            expect(response.statusCode).toBe(200)
        })
    });
});
describe('Integration test', () => {
    let token;
    const user = { email: "email@Test1.fr", login: "loginTest1", password: "passwordTest1" };

    beforeAll((done) => {
        console.log(process.env.API_KEY)
        db.on('error', console.error.bind(console, 'MongoDB connection error:'))
        app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
        db.dropCollection('users', () => {
            console.log('Cleaning - users collection dropped');
        });
        return done();
    })

    afterAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    describe('POST /user', () => {
        it('It should return 200', () => {
            return request(app)
                    .post("/api/v1/user")
                    .send({
                        login: user.login,
                        email: user.email,
                        password: user.password,
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(201);
            });
        });
        it('It should return 401', () => {
            return request(app)
                    .post("/api/v1/user")
                    .send({
                        login: user.login,
                        email: user.email,
                        password: user.password,
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
            });
        });
        it('It should return 400', () => {
            return request(app)
                    .post("/api/v1/user")
                    .send({
                        email: user.email,
                        password: user.password,
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
    });

    describe('POST /authenticate', () => {
        it('It should return 200 and token', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .send({
                        login: user.login,
                        password: user.password,
                    })
                    .then((response) => {
                        token = response.body.token;
                        expect(response.statusCode).toBe(200);
                        expect(response.body.token).toBeDefined();
            });
        });
        it('It should return 404', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .send({
                        login: "loginTest2",
                        password: user.password,
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(404);
                        expect(response.body.token).toBeUndefined();
            });
        });
        it('It should return 400', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .send({
                        login: user.login,
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
                        expect(response.body.token).toBeUndefined();
            });
        });
    });
    
    describe('GET /users', () => {
        it('It should return all users and 200', () => {
            return request(app)
                    .get("/api/v1/users")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(response.body.users).toBeDefined();
                        expect(response.body.users.length).toBe(1);
                        expect(response.body.users[0].login).toBe(user.login);
            });
        });
    });

    describe('GET /user', () => {
        it('It should return 200 and user with loginTest1 as login', () => {
            return request(app)
                    .get("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(response.body.login).toBe(user.login);
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
        it('It should return 200, test email update', () => {
            return request(app)
                    .put("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        newEmail: "email@Test1bis.fr"
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 200 and user with email@Test1bis.fr as email', () => {
            return request(app)
                    .get("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(response.body.email).toBe('email@Test1bis.fr');
            });
        });
        it('It should return 200, test password update', () => {
            return request(app)
                    .put("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        newPassword: 'newPassword'
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 200 if the password has been updated', () => {
            return request(app)
                    .post("/api/v1/authenticate")
                    .send({
                        login: user.login,
                        password: 'newPassword',
                    })
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
                        expect(response.body.token).toBeDefined();
            });
        });            
    });

    describe('POST /user/forgottenPassword', () => {
        it('It should return 400', () => {
            return request(app)
                    .post("/api/v1/user/forgottenPassword")
                    .then((response) => {
                        expect(response.statusCode).toBe(400);
            });
        });
        it('It should return 200', () => {
            return request(app)
                    .post("/api/v1/user/forgottenPassword")
                    .send({email: 'email@Test1bis.fr'})
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
    });

    describe('GET /checkToken', () => {
        it('It should return 200', () => {
            return request(app)
                    .get("/api/v1/checkToken")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(200);
            });
        });
        it('It should return 401, Unauthorized: No token provided', () => {
            return request(app)
                    .get("/api/v1/checkToken")
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
            });
        });
        it('It should return 401, Unauthorized: Invalid token', () => {
            return request(app)
                    .get("/api/v1/checkToken")
                    .set('Authorization', `Bearer falseToken`)
                    .then((response) => {
                        expect(response.statusCode).toBe(401);
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
        it('It should return 404, test if user has been deleted', () => {
            return request(app)
                    .get("/api/v1/user")
                    .set('Authorization', `Bearer ${token}`)
                    .then((response) => {
                        expect(response.statusCode).toBe(404);
            });
        });
    });
});