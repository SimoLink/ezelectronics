import { describe, test, expect, jest, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import UserController from "../../src/controllers/userController"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError"
import { Role, User } from "../../src/components/user"
import  { cleanup } from "../../src/db/cleanup"


const baseURL = "/ezelectronics"


let adminCookie: string
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
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
        const mockCreateUser = jest.spyOn(UserController.prototype, "createUser").mockImplementation((user, username)=>{
            return Promise.resolve(true);
        });
        const response = await request(app).post(baseURL + "/users/").send(testUser);
        expect(response.status).toBe(200);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)
        mockCreateUser.mockRestore();
    });

    test("POST /ezelectronics/users/, should return a 409 error code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const mockCreateUser = jest.spyOn(UserController.prototype, "createUser").mockImplementation((user, username)=>{
            return Promise.reject(new UserAlreadyExistsError());
        });
        const response = await request(app).post(baseURL + "/users/").send(testUser);
        expect(response.status).toBe(409);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)
        mockCreateUser.mockRestore();
    });

    test("POST /ezelectronics/users/, should return a 422 error code", async () => {
        const testUser = { 
            username: "",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const mockCreateUser = jest.spyOn(UserController.prototype, "createUser").mockImplementation((user, username)=>{
            return Promise.resolve(true);
        });
        const response = await request(app).post(baseURL + "/users/").send(testUser);
        expect(response.status).toBe(422);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
        mockCreateUser.mockRestore();
    });

    test("POST /ezelectronics/users/, should return a 503 error code", async () => {
        const testUser = { 
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        };
        const mockCreateUser = jest.spyOn(UserController.prototype, "createUser").mockImplementation((user, username)=>{
            return Promise.reject(new Error("errore generico"));
        });
        const response = await request(app).post(baseURL + "/users/").send(testUser);
        expect(response.status).toBe(503);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
        mockCreateUser.mockRestore();
    });

});

describe("suit for get '/users/'",()=>{

    test("GET /ezelectronics/users/, should return a 200 success code", async () => {
        const mockGetUsers = jest.spyOn(UserController.prototype, "getUsers").mockImplementation(() => {
            return Promise.resolve([
                {
                    username: "user1",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "address",
                    birthdate: "birthdate"
                },
                {
                    username: "user2",
                    name: "name",
                    surname: "surname",
                    role: Role.ADMIN,
                    address: "address",
                    birthdate: "birthdate"
                }
            ]);
        });
        const response = await request(app).get(`${baseURL}/users/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
        mockGetUsers.mockRestore();
    }); 

    test("GET /ezelectronics/users/, should return a 503 error code", async () => {
        const mockGetUsers = jest.spyOn(UserController.prototype, "getUsers").mockImplementation(() => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).get(`${baseURL}/users/`).set("Cookie", adminCookie);
        expect(response.status).toBe(503);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
        mockGetUsers.mockRestore();
    }); 

    test("GET /ezelectronics/users/, should return a 401 error code", async () => {
        const mockGetUsers = jest.spyOn(UserController.prototype, "getUsers").mockImplementation(() => {
            return Promise.resolve([
                {
                    username: "user1",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "address",
                    birthdate: "birthdate"
                },
                {
                    username: "user2",
                    name: "name",
                    surname: "surname",
                    role: Role.ADMIN,
                    address: "address",
                    birthdate: "birthdate"
                }
            ]);
        });

        const response = await request(app).get(`${baseURL}/users/`);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(401);
        mockGetUsers.mockRestore();
    });

});

describe("suit for get '/roles/:role'", ()=>{

    test("GET /ezelectronics/users/roles/:role/, should return a 200 success code", async () => {
        const mockGetUsersByRole = jest.spyOn(UserController.prototype, "getUsersByRole").mockImplementation((role) => {
            return Promise.resolve([new User("user1","name","surname",Role.CUSTOMER,"address","birthdate")]);
        });
        const response = await request(app).get(`${baseURL}/users/roles/Customer/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
        mockGetUsersByRole.mockRestore();
    }); 

    test("GET /ezelectronics/users/roles/:role/, should return a 503 error code", async () => {
        const mockGetUsersByRole = jest.spyOn(UserController.prototype, "getUsersByRole").mockImplementation((role) => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).get(`${baseURL}/users/roles/Customer/`).set("Cookie", adminCookie);
        expect(response.status).toBe(503);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
        mockGetUsersByRole.mockRestore();
    }); 

    test("GET /ezelectronics/users/roles/:role/, should return a 401 error code", async () => {
        const mockGetUsersByRole = jest.spyOn(UserController.prototype, "getUsersByRole").mockImplementation((role) => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).get(`${baseURL}/users/roles/Customer/`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(0);
        mockGetUsersByRole.mockRestore();
    }); 

});

describe("suit for get '/:username/'", ()=>{

    test("GET /ezelectronics/users/:username, should return a 200 success code", async () => {
        const mockGetUsersByUsername = jest.spyOn(UserController.prototype, "getUserByUsername").mockImplementation((user, username) => {
            return Promise.resolve(new User("user1","name","surname",Role.CUSTOMER,"address","birthdate"));
        });
        const response = await request(app).get(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        mockGetUsersByUsername.mockRestore();
    }); 

    test("GET /ezelectronics/users/:username/, should return a 503 error code", async () => {
        const mockGetUsersByUsername = jest.spyOn(UserController.prototype, "getUserByUsername").mockImplementation((user, username) => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).get(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(503);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        mockGetUsersByUsername.mockRestore();
    }); 

    test("GET /ezelectronics/users/:username/, should return a 401 error code", async () => {
        const mockGetUsersByUsername = jest.spyOn(UserController.prototype, "getUserByUsername").mockImplementation((user, username) => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).get(`${baseURL}/users/admin/`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
        mockGetUsersByUsername.mockRestore();
    }); 

    test("GET /ezelectronics/users/:username/, should return a 404 error code", async () => {
        const mockGetUsersByUsername = jest.spyOn(UserController.prototype, "getUserByUsername").mockImplementation((user, username) => {
            return Promise.reject(new UserNotFoundError());
        });
        const response = await request(app).get(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(404);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        mockGetUsersByUsername.mockRestore();
    }); 

});

describe("suit for delete '/:username'", ()=>{

    test("DELETE /ezelectronics/users/:username/, should return a 200 success code", async () => {
        const mockDeleteUser = jest.spyOn(UserController.prototype, "deleteUser").mockImplementation((user, username) => {
            return Promise.resolve(true);
        });
        const response = await request(app).delete(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
        mockDeleteUser.mockRestore();
    }); 

    test("DELETE /ezelectronics/users/:username/, should return a 401 error code", async () => {
        const mockDeleteUser = jest.spyOn(UserController.prototype, "deleteUser").mockImplementation((user, username) => {
            return Promise.resolve(true);
        });
        const response = await request(app).delete(`${baseURL}/users/admin/`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(0);
        mockDeleteUser.mockRestore();
    }); 

    test("DELETE /ezelectronics/users/:username/, should return a 503 error code", async () => {
        const mockDeleteUser = jest.spyOn(UserController.prototype, "deleteUser").mockImplementation((user, username) => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).delete(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(503);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
        mockDeleteUser.mockRestore();
    }); 

    test("DELETE /ezelectronics/users/:username/, should return a 404 error code", async () => {
        const mockDeleteUser = jest.spyOn(UserController.prototype, "deleteUser").mockImplementation((user, username) => {
            return Promise.reject(new UserNotFoundError());
        });
        const response = await request(app).delete(`${baseURL}/users/admin/`).set("Cookie", adminCookie);
        expect(response.status).toBe(404);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
        mockDeleteUser.mockRestore();
    }); 

});

describe("suit for delete '/'", ()=>{

    test("DELETE /ezelectronics/users/, should return a 200 success code", async () => {
        const mockDeleteAll = jest.spyOn(UserController.prototype, "deleteAll").mockImplementation(() => {
            return Promise.resolve(true);
        });
        const response = await request(app).delete(`${baseURL}/users/`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
        mockDeleteAll.mockRestore();
    }); 

    test("DELETE /ezelectronics/users/, should return a 401 error code", async () => {
        const mockDeleteAll = jest.spyOn(UserController.prototype, "deleteAll").mockImplementation(() => {
            return Promise.resolve(true);
        });
        const response = await request(app).delete(`${baseURL}/users/`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(0);
        mockDeleteAll.mockRestore();
    }); 

    test("DELETE /ezelectronics/users/, should return a 503 error code", async () => {
        const mockDeleteAll = jest.spyOn(UserController.prototype, "deleteAll").mockImplementation(() => {
            return Promise.reject(Error("errore generico"));
        });
        const response = await request(app).delete(`${baseURL}/users/`).set("Cookie", adminCookie);
        expect(response.status).toBe(503);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
        mockDeleteAll.mockRestore();
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
        const mockUpdateUserInfo = jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username) => {
            return Promise.resolve(new User("test", "test", "test", Role.MANAGER, "test", "test"));
        });
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(200);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        mockUpdateUserInfo.mockRestore();
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
        const mockUpdateUserInfo = jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username) => {
            return Promise.reject(new UserNotFoundError());
        });
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(404);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        mockUpdateUserInfo.mockRestore();
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
        const mockUpdateUserInfo = jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username) => {
            return Promise.resolve(new User("test", "test", "test", Role.MANAGER, "test", "test"));
        });
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(422);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
        mockUpdateUserInfo.mockRestore();
    });

    test("PATCH /ezelectronics/users/:username, should return a 503 success code", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager",
            birthdate: "2024-06-11",
            address: "test"
        };
        const mockUpdateUserInfo = jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username) => {
            return Promise.reject(new Error("errore generico"));
        });
        const response = await request(app).patch(`${baseURL}/users/test`).set("Cookie", adminCookie).send(testUser);
        expect(response.status).toBe(503);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        mockUpdateUserInfo.mockRestore();
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
        const mockUpdateUserInfo = jest.spyOn(UserController.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username) => {
            return Promise.resolve(new User("test", "test", "test", Role.MANAGER, "test", "test"));
        });
        const response = await request(app).patch(`${baseURL}/users/test`).send(testUser);
        expect(response.status).toBe(401);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
        mockUpdateUserInfo.mockRestore();
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

    test("GET /ezelectronics/sessions/current/, should return a 200 success code and the current user", async () => {
        const response = await request(app).get(`${baseURL}/sessions/current`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
        expect(response.body.username).toBe(admin.username);
    });
     
});

describe("suit for delete '/current'",()=>{

    test("DELETE /ezelectronics/sessions, should return a 200 success code", async () => {
        const response = await request(app).delete(`${baseURL}/sessions/current`).set("Cookie", adminCookie);
        expect(response.status).toBe(200);
    });  
    
    test("DELETE /ezelectronics/sessions, should return a 401 error code", async () => {
        const response = await request(app).delete(`${baseURL}/sessions/current`);
        expect(response.status).toBe(401);      
    });  

});