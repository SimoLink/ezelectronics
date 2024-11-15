import { describe, test, expect, jest, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"

import { Role, User } from "../src/components/user"
import  { cleanup } from "../src/db/cleanup"


const baseURL = "/ezelectronics"


let adminCookie: string
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: Role.ADMIN }
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${baseURL}/users`)
        .send(userInfo)
        .expect(200);
};

const login = async (userInfo: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.header["set-cookie"][0]);
            });
    });
};


beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    adminCookie = await login(admin);
});

afterAll(async () => {
    await cleanup();
});



describe("suit for post '/users'", ()=>{

    test("POST /ezelectronics/users/, should return a 200 success code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const response = await request(app).post(baseURL + "/users").send(testUser);
        expect(response.status).toBe(200);
    });

    test("POST /ezelectronics/users/, should return a 409 error code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const response = await request(app).post(baseURL + "/users").send(testUser);
        expect(response.status).toBe(409);
    });

    test("POST /ezelectronics/users/, should return a 422 error code", async () => {
        const testUser = { 
            username: "",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const response = await request(app).post(baseURL + "/users").send(testUser);
        expect(response.status).toBe(422);
    });

});

describe("suit for get '/'",()=>{

    test("GET /ezelectronics/users/, should return a 200 success code", async () => {
        const response = await request(app).get(`${baseURL}/users/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    });

    test("GET /ezelectronics/users/, should return a 401 error code", async () => {
        const response = await request(app).get(`${baseURL}/users/`);
        expect(response.status).toBe(401);
    });

});

describe("suit for get '/roles/:role'", ()=>{

    test("GET /ezelectronics/roles/:role, should return a 200 success code", async () => {
        const response = await request(app).get(`${baseURL}/users/roles/Customer`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    });

    test("GET /ezelectronics/roles/:role, should return a 401 error code", async () => {
        const response = await request(app).get(`${baseURL}/users/roles/Customer`);
        expect(response.status).toBe(401);
    }); 

});

describe("suit for get '/:username'", ()=>{

    test("GET /ezelectronics/users/:username, should return a 200 success code", async () => {
        const response = await request(app).get(`${baseURL}/users/admin`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    });

    test("GET /ezelectronics/users/:username, should return a 401 error code", async () => {
        const response = await request(app).get(`${baseURL}/users/admin`);
        expect(response.status).toBe(401);
    }); 

    test("GET /ezelectronics/users/:username, should return a 404 error code", async () => {
        const response = await request(app).get(`${baseURL}/users/prova`).set("Cookie", adminCookie);
        expect(response.status).toBe(404);
    }); 

});

describe("suit for delete '/:username'", ()=>{

    test("DELETE /ezelectronics/users/:username, should return a 200 success code", async () => {
        const response = await request(app).delete(`${baseURL}/users/admin`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        await postUser(admin);
        adminCookie = await login(admin);
    }); 

    test("DELETE /ezelectronics/users/:username, should return a 404 error code", async () => {
        const response = await request(app).delete(`${baseURL}/users/prova`).set("Cookie", adminCookie);
        expect(response.status).toBe(404);
    }); 

    test("DELETE /ezelectronics/users/:username, should return a 401 error code", async () => {
        const response = await request(app).delete(`${baseURL}/users/admin`);
        expect(response.status).toBe(401);
    }); 

});

describe("suit for delete '/'", ()=>{

    test("DELETE /ezelectronics/users/, should return a 200 success code", async () => {
        const response = await request(app).delete(`${baseURL}/users`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    }); 

    test("DELETE /ezelectronics/users/, should return a 401 error code", async () => {
        const response = await request(app).delete(`${baseURL}/users`);
        expect(response.status).toBe(401);
    });

});


describe("suit for patch '/:username'", ()=>{

    test("PATCH /ezelectronics/users/:username, should return a 200 success code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager",
            birthdate: "2024-06-11",
            address: "test"
        };
        await postUser(testUser);
        testUser.name = "test2";
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(200);
    });

    test("PATCH /ezelectronics/users/:username, should return a 404 error code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager",
            birthdate: "2024-06-11",
            address: "test"
        };
        const response = await request(app).patch(`${baseURL}/users/prova`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(404);
    }); 

    test("PATCH /ezelectronics/users/:username, should return a 422 error code", async () => {
        const testUser = {
            username: "",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager",
            birthdate: "2024-06-11",
            address: "test"
        };
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(422);
    });

    test("PATCH /ezelectronics/users/:username, should return a 401 error code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager",
            birthdate: "2024-06-11",
            address: "test"
        };
        const response = await request(app).patch(`${baseURL}/users/test`).send(testUser);
        expect(response.status).toBe(401);
    });

});

describe("suit for post '/sessions'",()=>{

    test("POST /ezelectronics/sessions/, should return a 200 success code and the current user", async () => {
        const testUser = {
            username:"admin",
            password:"admin"
        };
        const response = await request(app).post(`${baseURL}/sessions`).send(testUser);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe(admin.username);
    });

    test("POST /ezelectronics/sessions/, should return a 422 error", async () => {
        const testUser = {
            username:"",
            password:"admin"
        };
        const response = await request(app).post(`${baseURL}/sessions`).send(testUser);
        expect(response.status).toBe(422);
    });

    test("POST /ezelectronics/sessions/, should return a 401 error", async () => {
        const testUser = {
            username:"test",
            password:"admin"
        };
        const response = await request(app).post(`${baseURL}/sessions`).send(testUser);
        expect(response.status).toBe(401);
    });
    
});

describe("suit for get '/sessions/current'",()=>{

    test("GET /ezelectronics/current/, should return a 200 success code and the current user", async () => {
        const response = await request(app).get(`${baseURL}/sessions/current`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe(admin.username);
    });
    
});

describe("suit for delete '/current'",()=>{

    test("DELETE /ezelectronics/sessions/current/, should return a 200 success code", async () => {
        const response = await request(app).delete(`${baseURL}/sessions/current`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    });  
    
    test("DELETE /ezelectronics/sessions/current/, should return a 401 error code", async () => {
        const response = await request(app).delete(`${baseURL}/sessions/current`);
        expect(response.status).toBe(401);      
    });  

});

