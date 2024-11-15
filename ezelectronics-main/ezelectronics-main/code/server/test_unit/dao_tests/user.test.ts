import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { UserAlreadyExistsError, UserIsAdminError, UserNotAdminError, UserNotFoundError } from "../../src/errors/userError"
import { Role, User } from "../../src/components/user"
import { Utility } from "../../src/utilities"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")


describe("test per createUser", ()=>{
    
    test("create user, return true", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
        });
        const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
            return (Buffer.from("salt"));
        })
        const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        const result = await userDAO.createUser("username", "name", "surname", "password", "role");
        expect(result).toBe(true);
        mockRandomBytes.mockRestore();
        mockDBRun.mockRestore();
        mockScrypt.mockRestore();
    })

    test("Create user, Username Duplication", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            const error = new Error("UNIQUE constraint failed: users.username");
            callback(error);
            return {} as Database;
        });
        const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
            return (Buffer.from("salt"));
        })
        const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        await expect(userDAO.createUser("username", "name", "surname", "password", "role")).rejects.toThrow(UserAlreadyExistsError);
        mockRandomBytes.mockRestore();
        mockDBRun.mockRestore();
        mockScrypt.mockRestore();
    })

    test("create user, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            const error = new Error();
            callback(error);
            return {} as Database;
        });
        const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
            return (Buffer.from("salt"));
        })
        const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        await expect(userDAO.createUser("username", "name", "surname", "password", "role")).rejects.toThrow(Error);
        mockRandomBytes.mockRestore();
        mockDBRun.mockRestore();
        mockScrypt.mockRestore();
    })

    test("Create user, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
        });
        const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
            throw  new Error();
        })
        const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        const result = userDAO.createUser("username", "name", "surname", "password", "role");
        await expect(result).rejects.toThrow(new Error());
        mockRandomBytes.mockRestore();
        mockDBRun.mockRestore();
        mockScrypt.mockRestore();
    })

});


describe("test true per getIsUserAuthenticated", ()=>{

    test("getIsUserAuthenticated, should resolve true", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {
                username: "username",
                password: Buffer.from("hashedPassword", "utf-8").toString('hex'),
                salt: "salt"
            });
            return {} as Database;
        });
        const mockScryptSync = jest.spyOn(crypto, "scryptSync").mockImplementation((password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementation((a, b)=>{
            return true;
        });
        const result = await userDAO.getIsUserAuthenticated("username", "password");
        expect(result).toBe(true);
        mockDBRun.mockRestore();
        mockScryptSync.mockRestore();
        mockTimingSafeEqual.mockRestore();
    })

    test("test false per getIsUserAuthenticated", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {
                password: Buffer.from("hashedPassword", "utf-8").toString('hex'),
                salt: "salt"
            });
            return {} as Database;
        });
        const mockScryptSync = jest.spyOn(crypto, "scryptSync").mockImplementation((password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementation((a, b)=>{
            return true;
        });
        const result = await userDAO.getIsUserAuthenticated("username", "password");
        expect(result).toBe(false);
        mockDBRun.mockRestore();
        mockScryptSync.mockRestore();
        mockTimingSafeEqual.mockRestore();
    })

    test("getIsUsserAuthenticated, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {
                username: "username",
                password: Buffer.from("hashedPassword", "utf-8").toString('hex'),
                salt: "salt"
            });
            return {} as Database;
        });
        const mockScryptSync = jest.spyOn(crypto, "scryptSync").mockImplementation((password, salt, keylen) => {
            return Buffer.from("hashedPassword");
        })
        const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementation((a, b)=>{
            throw new Error();
        });
        const result = userDAO.getIsUserAuthenticated("username", "password");
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore();
        mockScryptSync.mockRestore();
        mockTimingSafeEqual.mockRestore();
    })

});

describe("suite for getUserByUsername", ()=>{

    test("getUserByUsername, All good", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, {
                username:"username",
                name:"name",
                surname:"surname",
                role:"role",
                password:"password",
                salt:"salt",
                address:"address",
                birthdate:"birthdate"
            });
            return {} as Database;
        });
        const result = await userDAO.getUserByUsername("username");
        expect(result).toEqual({
            username:"username",
            name:"name",
            surname:"surname",
            role:"role",
            address:"address",
            birthdate:"birthdate"
        });
        mockDBRun.mockRestore();
    }); 
    
    test("getUserByUsername, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(Error(), {
                username:"username",
                name:"name",
                surname:"surname",
                role:"role",
                password:"password",
                salt:"salt",
                address:"address",
                birthdate:"birthdate"
            });
            return {} as Database;
        });
        await expect(userDAO.getUserByUsername("username")).rejects.toThrow(new Error());
        mockDBRun.mockRestore();
    })

    test("getUserByUsername, UserNotFound", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, null);
            return {} as Database;
        });
        await expect(userDAO.getUserByUsername("username")).rejects.toThrow(new UserNotFoundError());
        mockDBRun.mockRestore();
    })

    test("getUserByUsername, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            throw new Error();
        });
        const result = userDAO.getUserByUsername("username");
        await expect(result).rejects.toThrow(Error());
        mockDBRun.mockRestore();
    })  

});


describe("suit for updateUserInfo", ()=>{

    test("updateUserInfo, All good", async () => {
        const userDAO = new UserDAO();
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback)  {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const result = await userDAO.updateUserInfo({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "newName", "newSurname", "address", "birthdate", "username");
        expect(result).toEqual({
            username:"username",
            name:"newName",
            surname:"newSurname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        });
        mockDBRun.mockRestore();
        mockGetUserByUsername.mockRestore();
        mockIsAdmin.mockRestore();
    })

    test("updateUserInfo, UserNotFound", async () => {
        const userDAO = new UserDAO();
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.reject(new UserNotFoundError());
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback)  {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const result = userDAO.updateUserInfo({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "name", "surname", "address", "birthdate", "username");
        await expect(result).rejects.toThrow(new  UserNotFoundError());
        mockDBRun.mockRestore();
        mockGetUserByUsername.mockRestore();
        mockIsAdmin.mockRestore();
    })

    test("updateUserInfo, otherChangingAdmin", async () => {
        const userDAO = new UserDAO();
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"michele",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback)  {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return true;
        });
        const result = userDAO.updateUserInfo({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "name", "surname", "address", "birthdate", "michele");
        await expect(result).rejects.toThrow(new  UserNotAdminError());
        mockDBRun.mockRestore();
        mockGetUserByUsername.mockRestore();
        mockIsAdmin.mockRestore();
    })

    test("updateUserInfo, database error", async () => {
        const userDAO = new UserDAO();
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"michele",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback)  {
            callback.call({changes:1}, Error());
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const result = userDAO.updateUserInfo({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "michele", "surname", "address", "birthdate", "michele");
        await expect(result).rejects.toThrow(new  Error());
        mockDBRun.mockRestore();
        mockGetUserByUsername.mockRestore();
        mockIsAdmin.mockRestore();
    })

    test("updateUserInfo, no changes", async () => {
        const userDAO = new UserDAO();
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (sql, params, callback)  {
            callback.call({changes:0}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const result = await userDAO.updateUserInfo({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "name", "surname", "address", "birthdate", "username");
        expect(result).toEqual({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        });
        mockDBRun.mockRestore();
        mockGetUserByUsername.mockRestore();
        mockIsAdmin.mockRestore();
    })

});

describe("suit for getAllUsers", ()=>{

    test("getAllUsers, All good", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(null, [
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                },
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                }
            ]);
            return {} as Database;
        });
        const result = await userDAO.getAllUsers();
        expect(result).toEqual([
            {
                username:"username",
                name:"name",
                surname:"surname",
                role:Role.CUSTOMER,
                address:"address",
                birthdate:"birthdate"
            },
            {
                username:"username",
                name:"name",
                surname:"surname",
                role:Role.CUSTOMER,
                address:"address",
                birthdate:"birthdate"
            }
        ]);
        mockDBAll.mockRestore();
    })

    test("getAllUsers, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(Error(), [
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                },
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                }
            ]);
            return {} as Database;
        });
        const result = userDAO.getAllUsers();
        await expect(result).rejects.toThrow(new Error());
        mockDBAll.mockRestore();
    })

    test("getAllUsers, general error", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(null, null);
            return {} as Database;
        });
        const result = userDAO.getAllUsers();
        await expect(result).rejects.toThrow(Error("rows is not iterable"));
        mockDBAll.mockRestore();
    })

});


describe("suit for getUsersByRole",()=>{

    test("getUsersByRole, All good", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(null, [
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                },
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                }
            ]);
            return {} as Database;
        });
        const result = await userDAO.getUsersByRole("customer");
        expect(result).toEqual([
            {
                username:"username",
                name:"name",
                surname:"surname",
                role:Role.CUSTOMER,
                address:"address",
                birthdate:"birthdate"
            },
            {
                username:"username",
                name:"name",
                surname:"surname",
                role:Role.CUSTOMER,
                address:"address",
                birthdate:"birthdate"
            }
        ]);
        mockDBAll.mockRestore();
    })

    test("getUsersByRole, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(Error(), [
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                },
                {
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                }
            ]);
            return {} as Database;
        });
        const result = userDAO.getUsersByRole("customer");
        await expect(result).rejects.toThrow(new Error());
        mockDBAll.mockRestore();
    })

    test("getUsersByRole, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBAll = jest.spyOn(db, "all").mockImplementation( (sql, params, callback) => {
            callback(null, null);
            return {} as Database;
        });
        const result = userDAO.getUsersByRole("customer");
        await expect(result).rejects.toThrow(Error("rows is not iterable"));
        mockDBAll.mockRestore();
    })

});


describe("suit for deleteUser", ()=>{
    
    test("deleteUser, All good", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const result = await userDAO.deleteUser({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "username");
        expect(result).toBe(true);
        mockDBRun.mockRestore();
        mockIsAdmin.mockRestore();
        mockGetUserByUsername.mockRestore();
    })

    test("deleteUser, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call({changes:1}, Error());
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return false;
        });
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const result = userDAO.deleteUser({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "username");
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore();
        mockIsAdmin.mockRestore();
        mockGetUserByUsername.mockRestore();
    })

    test("deleteUser, isAdmin", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            return true;
        });
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"michele",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const result = userDAO.deleteUser({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "michele");
        await expect(result).rejects.toThrow(new UserIsAdminError());
        mockDBRun.mockRestore();
        mockIsAdmin.mockRestore();
        mockGetUserByUsername.mockRestore();
    })

    test("deleteuser, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call();
            return {} as Database;
        });
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((other)=>{
            throw new Error();
        });
        const mockGetUserByUsername = jest.spyOn(userDAO, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve({
                    username:"username",
                    name:"name",
                    surname:"surname",
                    role:Role.CUSTOMER,
                    address:"address",
                    birthdate:"birthdate"
                });
            });
        const result = userDAO.deleteUser({
            username:"username",
            name:"name",
            surname:"surname",
            role:Role.CUSTOMER,
            address:"address",
            birthdate:"birthdate"
        }, "username");
        await expect(result).rejects.toThrow(Error("Cannot read properties of undefined (reading 'changes')"));
        mockDBRun.mockRestore();
        mockIsAdmin.mockRestore();
        mockGetUserByUsername.mockRestore();
    })

});

describe("suite for delete all", ()=>{
    test("deleteAll, All good", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call({changes:1}, null);
            return {} as Database;
        });
        const result = await userDAO.deleteAll();
        expect(result).toBe(true);
        mockDBRun.mockRestore();
    })

    test("deleteAll, database error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( function(sql, params, callback) {
            callback.call({changes:1}, Error());
            return {} as Database;
        });
        const result = userDAO.deleteAll();
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore();
    })

    test("deleteAll, generic error", async () => {
        const userDAO = new UserDAO();
        const mockDBRun = jest.spyOn(db, "run").mockImplementation( (sql, params, callback)=> {
            callback();
            throw new Error();
        });
        const result = userDAO.deleteAll();
        await expect(result).rejects.toThrow(Error("Cannot read properties of undefined (reading 'changes')"));
        mockDBRun.mockRestore();
    })
});