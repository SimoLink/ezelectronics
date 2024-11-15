import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import ReviewController from "../../src/controllers/reviewController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"
import ErrorHandler from "../../src/helper"
import { isString } from "util"
import { ProductReview } from "../../src/components/review"
const baseURL = "/ezelectronics"

//For unit tests, we need to validate the internal logic of a single component, without the need to test the interaction with other components
//For this purpose, we mock (simulate) the dependencies of the component we are testing
jest.mock("../../src/controllers/reviewController")
jest.mock("../../src/routers/auth")

describe("route unit tests", () => {
    describe("POST /reviews/:model", () => {
        test("it should return 200 success code", async () => {

            const mockReview = {
                comment: "test",
                score: 5
            }

            const mockuser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
            
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isInt: () => ({}),
                })),
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                }))
            }))
            //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce(undefined)

            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                (req as any).user = mockuser
                return next()
            })

            const response = await request(app).post(baseURL + "/reviews/:model").send(mockReview)
            expect(response.status).toBe(200)
            expect(ReviewController.prototype.addReview).toHaveBeenCalled()
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(":model",mockuser,mockReview.score, mockReview.comment)
        })

        test("testing if comment is empty. It should return 422 code", async () => {

            const mockReview = {
                comment: "",
                score: 5
            }
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            //We mock the 'param' method of the express-validator to throw an error, because we are not testing the validation logic here (we assume it works correctly)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => {
                    throw new Error("Invalid value");
                }),
            }));
            //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
            })
            //We call the route with dependencies mocked to simulate an error scenario, and expect a 422 code
            const response = await request(app).post(baseURL + "/reviews/:model").send(mockReview)
            expect(response.status).toBe(422)
        })

        test("testing if user is Customer, it should return 401", async () => {
            
            const mockReview = {
                comment: "test",
                score: 5
            }
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).post(baseURL + "/reviews/:model").send(mockReview)
            expect(response.status).toBe(401)
        })

        test("testing if user is authenticated, it should return 401", async () => {
            
            const mockReview = {
                comment: "test",
                score: 5
            }
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated" });
            })

            const response = await request(app).post(baseURL + "/reviews/:model").send(mockReview)
            expect(response.status).toBe(401)
        })
    })

    describe("GET /reviews/:model", () => {

        test("it should return 200 success code", async () => {
            const mockuser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
            const mockReview = new ProductReview("test", "test", 5, "test", "test")
            jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce([mockReview])

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                (req as any).user = mockuser
                return next();
            })

            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            const response = await request(app).get(baseURL + "/reviews/:model")
            expect(response.status).toBe(200)
            expect(ReviewController.prototype.getProductReviews).toHaveBeenCalled()
            expect(response.body).toEqual([mockReview])
        })

        test("testing if user is authenticated, it should return 401", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated" });
            })

            const response = await request(app).get(baseURL + "/reviews/:model")
            expect(response.status).toBe(401)           
        })

        // test("testing if param.model is not empty. It should return 422 code", async () => {
        //     jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
        //         return next();
        //     })
        //     //We mock the 'param' method of the express-validator to throw an error, because we are not testing the validation logic here (we assume it works correctly)
        //     jest.mock('express-validator', () => ({
        //         param: jest.fn().mockImplementation(() => {
        //             throw new Error("Invalid value");
        //         }),
        //     }));

        //     //We mock the 'validateRequest' method to receive an error and return a 422 error code, because we are not testing the validation logic here (we assume it works correctly)
        //     jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
        //         return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        //     })
        //     //We call the route with dependencies mocked to simulate an error scenario, and expect a 422 code
        //     const response = await request(app).get(baseURL + "/reviews/:model")
        //     expect(response.status).toBe(422)
           
        // })
    })

    describe("DELETE /reviews/:model", () => {

        test("it should return 200 success code", async () => {

            const mockuser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                }))
            }))
            //We mock the ErrorHandler validateRequest method to return the next function, because we are not testing the validation logic here (we assume it works correctly)
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined)
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                (req as any).user = mockuser
                return next();
            })

            const response = await request(app).delete(baseURL + "/reviews/:model")
            expect(response.status).toBe(200)
        })

        test("testing if user is authenticated, it should return 401", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated" });
            })

            const response = await request(app).delete(baseURL + "/reviews/:model")
            expect(response.status).toBe(401)           
        })

        test("testing if user is Customer, it should return 401", async () => {
            
            jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/reviews/:model")
            expect(response.status).toBe(401)
        })
    })

    describe("DELETE /reviews/:model/all", () => {
        test("it should return 200 success code", async () => {
            
            jest.mock('express-validator', async () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                }))
            }))
            
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined)
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/reviews/:model/all")
            expect(response.status).toBe(200)
        })

        test("testing if user is authenticated, it should return 401", async () => {

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthenticated" });
            })

            const response = await request(app).delete(baseURL + "/reviews/:model/all")
            expect(response.status).toBe(401)           
        })

        test("testing if user is Admin or Manager, it should return 401", async () => {
            
            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/reviews/:model/all")
            expect(response.status).toBe(401)
        })
    })
})