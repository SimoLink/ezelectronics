import { describe, test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { Role } from "../../src/components/user"
import { BirthdayError, UnauthorizedUserError } from "../../src/errors/userError"
import dayjs from "dayjs"
import { Utility } from "../../src/utilities"

jest.mock("../../src/dao/userDAO")

describe("suite for createUser", ()=>{

    test("createUser, should return true", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        const mockCreateUser = jest.spyOn(UserDAO.prototype, "createUser").mockImplementation((username, name, surname, password, role)=>{
            return Promise.resolve(true);
         });
        const controller = new UserController();
        const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role);
        expect(response).toBe(true);
        mockCreateUser.mockRestore();
    });

});

describe("suit for getUsers", ()=>{
    
    test("getUsers, should return true", async () => {
        const mockGetAllUsers = jest.spyOn(UserDAO.prototype, "getAllUsers").mockImplementation(()=>{
            return Promise.resolve([
            {
                username:"user1",
                name: "name",
                surname:"surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "birthdate"
            },
            {
                username:"user2",
                name: "name",
                surname:"surname",
                role: Role.ADMIN,
                address: "address",
                birthdate: "birthdate"
            }])});
        const controller = new UserController();
        const response = await controller.getUsers();
        expect(UserDAO.prototype.getAllUsers).toHaveBeenCalledTimes(1);
        expect(response).toEqual([
            {
                username:"user1",
                name: "name",
                surname:"surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "birthdate"
            },
            {
                username:"user2",
                name: "name",
                surname:"surname",
                role: Role.ADMIN,
                address: "address",
                birthdate: "birthdate"
            }]);
            mockGetAllUsers.mockRestore();
    });

});

describe("suit for getUsersByRole", ()=>{

    test("getUsersByRole, should return true", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([
            {
                username:"user1",
                name: "name",
                surname:"surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "birthdate"
            }]);
        const controller = new UserController();
        const response = await controller.getUsersByRole(Role.CUSTOMER);
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(Role.CUSTOMER);
        expect(response).toEqual([
            {
                username:"user1",
                name: "name",
                surname:"surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "birthdate"
            }]);
    });

});

describe("suite for getUserByUsername", ()=>{

    test("getUserByUsername, all good", async () => {
        const testUser = { 
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockGetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve(testUser);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            return
        })
        const response = await controller.getUserByUsername(testUser, testUser.username);
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testUser.username);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, testUser.username);
        expect(response).toBe(testUser);
        mockTestSameUsers.mockRestore();
        mockGetUserByUsername.mockRestore();
    });

    test("getUserByUsername, not same username", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockGetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockImplementation((username)=>{
            return Promise.resolve(testUser);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            throw new UnauthorizedUserError();
        })
        const response = controller.getUserByUsername(testUser, "username");
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, "username");
        await expect(response).rejects.toThrow(new UnauthorizedUserError());
        mockTestSameUsers.mockRestore();
        mockGetUserByUsername.mockRestore();
    });

});

describe("suite for deleteUser", ()=>{

    test("deleteUser, all good", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockDeleteUser = jest.spyOn(UserDAO.prototype, "deleteUser").mockImplementation((user, username)=>{
            return Promise.resolve(true);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            return
        })
        const response = await controller.deleteUser(testUser, testUser.username);
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, testUser.username);
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser, testUser.username);
        expect(response).toBe(true);
        mockTestSameUsers.mockRestore();
        mockDeleteUser.mockRestore();
    });

    test("deleteUser, no same user", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockDeleteUser = jest.spyOn(UserDAO.prototype, "deleteUser").mockImplementation((user, username)=>{
            return Promise.resolve(true);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            throw new UnauthorizedUserError();
        })
        const response = controller.deleteUser(testUser, "username");
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(0);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, "username");
        await expect(response).rejects.toThrow(new UnauthorizedUserError());
        mockTestSameUsers.mockRestore();
        mockDeleteUser.mockRestore();
    });

});

describe("suite for deleteAll", ()=>{

    test("deleteAll, all good", async () => {
        const mockDeleteAll = jest.spyOn(UserDAO.prototype, "deleteAll").mockImplementation(()=>{
            return Promise.resolve(true);
        });
        const controller = new UserController();
        const response = await controller.deleteAll();
        expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
        mockDeleteAll.mockRestore();
    });

});

describe("suit for updateUserInfo", ()=>{

    test("updateUserInfo, all good", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockUpdateUserInfo = jest.spyOn(UserDAO.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username)=>{
            return Promise.resolve(testUser);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            return
        })
        let mockIsAfter = jest.spyOn(dayjs.prototype, "isAfter").mockImplementation((data)=>{
            return false;
        })
        const response = await controller.updateUserInfo(testUser, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testUser, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, testUser.username);
        expect(dayjs.prototype.isAfter).toHaveBeenCalledTimes(1);
        expect(response).toBe(testUser);
        mockTestSameUsers.mockRestore();
        mockUpdateUserInfo.mockRestore();
        mockIsAfter.mockRestore();
    });

    test("updateUserInfo, notSameUser", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockUpdateUserInfo = jest.spyOn(UserDAO.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username)=>{
            return Promise.resolve(testUser);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            throw new UnauthorizedUserError();
        })
        let mockIsAfter = jest.spyOn(dayjs.prototype, "isAfter").mockImplementation((data)=>{
            return false;
        })
        const response = controller.updateUserInfo(testUser, testUser.name, testUser.surname, testUser.address, testUser.birthdate, "username");
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, "username");
        expect(dayjs.prototype.isAfter).toHaveBeenCalledTimes(0);
        await expect(response).rejects.toThrow(new UnauthorizedUserError());
        mockTestSameUsers.mockRestore();
        mockUpdateUserInfo.mockRestore();
        mockIsAfter.mockRestore();
    });

    test("updateUserInfo, birthdayError", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockUpdateUserInfo = jest.spyOn(UserDAO.prototype, "updateUserInfo").mockImplementation((user, name, surname, address, birthdate, username)=>{
            return Promise.resolve(testUser);
        });
        const controller = new UserController();
        let mockTestSameUsers = jest.spyOn(UserController.prototype, "checkSameUser").mockImplementation((user, username)=>{
            return
        })
        let mockIsAfter = jest.spyOn(dayjs.prototype, "isAfter").mockImplementation((data)=>{
            return true;
        })
        const response = controller.updateUserInfo(testUser, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(0);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.checkSameUser).toHaveBeenCalledWith(testUser, testUser.username);
        expect(dayjs.prototype.isAfter).toHaveBeenCalledTimes(1);
        await expect(response).rejects.toThrow(new BirthdayError());
        mockTestSameUsers.mockRestore();
        mockUpdateUserInfo.mockRestore();
        mockIsAfter.mockRestore();
    });

});

describe("suite for checkSameUser", ()=>{

    test("checkSameUser, all good", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((user)=>{
            return false;
        });
        const controller = new UserController();
        const response = controller.checkSameUser(testUser, testUser.username);
        expect(Utility.isAdmin).toHaveBeenCalledTimes(1);
        expect(Utility.isAdmin).toHaveBeenCalledWith(testUser);
        expect(response).toBeUndefined;
        mockIsAdmin.mockRestore();
    });

    test("checkSameUser, not same user, not admin", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.CUSTOMER,
            address: "address",
            birthdate: "birthdate"
        }
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((user)=>{
            return false;
        });
        const controller = new UserController();
        try{
            controller.checkSameUser(testUser, "username");
        }catch(err){
            expect(Utility.isAdmin).toHaveBeenCalledTimes(1);
            expect(Utility.isAdmin).toHaveBeenCalledWith(testUser);
            expect(err).toEqual(new UnauthorizedUserError());
        }
        mockIsAdmin.mockRestore();
    });

    test("checkSameUser, not same user, is admin", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: Role.ADMIN,
            address: "address",
            birthdate: "birthdate"
        }
        const mockIsAdmin = jest.spyOn(Utility, "isAdmin").mockImplementation((user)=>{
            return true;
        });
        const controller = new UserController();
        const response = controller.checkSameUser(testUser, "username");
        expect(Utility.isAdmin).toHaveBeenCalledTimes(1);
        expect(Utility.isAdmin).toHaveBeenCalledWith(testUser);
        expect(response).toBeUndefined;
        mockIsAdmin.mockRestore();
    });

});