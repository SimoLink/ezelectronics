import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Category } from "../src/components/product"

const routePath = "/ezelectronics" //Base route path for the API

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const product = {model: "Iphone13", category: "Smartphone", quantity: 10, details: "very good!", sellingPrice: 200, arrivalDate: "2024-05-01"}
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

const postProduct = async (productInfo: any) => {
    await request(app)
        .post(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .send(productInfo)
        .expect(200)
}
//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
//Before executing tests, we remove everything from our test database, create an Admin user and log in as Admin, saving the cookie in the corresponding variable
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

const acquistaProdotto = async (userInfo: any, product: string) => {
        const productToBuy = {
            model: product
        }
        let cookie = await login(userInfo);
        await request(app)
            .post(`${routePath}/carts`)
            .set("Cookie", cookie)
            .send(productToBuy)
            .expect(200);
        await request(app)
            .patch(`${routePath}/carts`)
            .set("Cookie", cookie)
            .expect(200);
        await request(app)
            .delete(`${routePath}/sessions/current`)
            .set("Cookie", cookie)
            .expect(200);       
}

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(customer)
    adminCookie = await login(admin)
    await postProduct(product)
    await acquistaProdotto(customer, product.model)
    adminCookie = await login(admin)
})

//After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup()
})
describe("reviews integration tests", () => {

    describe("POST /reviews/:model", () => {
        test("it should return 200 success code and add a review to a product", async () => {
            const mockReview = {
                comment: "good product",
                score: 5
            }
            customerCookie = await login(customer)
            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", customerCookie)
                .send(mockReview)
                .expect(200)

            const reviews = await request(app)
                .get(`${routePath}/reviews/Iphone13`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(reviews.body).toHaveLength(1)
            let rev = reviews.body[0]

            expect(rev).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
            expect(rev.comment).toBe(mockReview.comment)
            expect(rev.score).toBe(mockReview.score)
        })

        test("It should return a 422 error code if at least one request body parameter is incorrect", async () => {
            customerCookie = await login(customer)
            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", customerCookie)
                .send({ comment: "", score: 5 })
                .expect(422)
            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", customerCookie)
                .send({ comment: "great product", score: 6 })
                .expect(422)
        })

        test("it should return 401 if user is not Customer", async () => {
            const mockReview = {
                comment: "good product",
                score: 5
            }
            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", adminCookie)
                .send(mockReview)
                .expect(401)

            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .send(mockReview)
                .expect(401)
        })

        test("it should fail if model doesn't exist", async () => {
            customerCookie = await login(customer)
            await request(app)
                .post(`${routePath}/reviews/Iphone69`)
                .set("Cookie", customerCookie)
                .send({ comment: "good product", score: 5 })
                .expect(404 || 503)
        })

        test("it should fail if user has already made a review for the product", async () => {

            const mockReview = {
                comment: "good product",
                score: 5
            }

            customerCookie = await login(customer)

            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", customerCookie)
                .send(mockReview)
                .expect(409)
        })
    })

    describe("GET /reviews/:model", () => {
        test("it should return 200 success code and return all reviews for a product", async () => {

            // creo una review per il prodotto Iphone13
            const mockReview = {
                comment: "nice product",
                score: 5
            }
            
            const customer2 = {
                 username: "customer2", name: "customer", surname: "customer", password: "customer", role: "Customer" }
            await postUser(customer2)
            await acquistaProdotto(customer2, "Iphone13")
            const customer2Cookie = await login(customer2)
            await request(app)
                .post(`${routePath}/reviews/Iphone13`)
                .set("Cookie", customer2Cookie)
                .send(mockReview)
                .expect(200)
            const reviews = await request(app)
                .get(`${routePath}/reviews/Iphone13`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(2)
            expect(reviews.body[1].comment).toBe(mockReview.comment)
            expect(reviews.body[1].score).toBe(mockReview.score)

        })

        test("it should fail if model string is empty or model doesn't exist", async () => {
            await request(app)
                .get(`${routePath}/reviews/`)
                .set("Cookie", adminCookie)
                .expect(404)

            await request(app)
                .get(`${routePath}/reviews/Iphone`)
                .set("Cookie", adminCookie)
                .expect(404)
        })

    })

    describe("DELETE /reviews/:model", () => {

        test("it should return 200 success code", async () => {



            const productDue = {model: "samsung", category: "Smartphone", quantity: 10, details: "very good!", sellingPrice: 200, arrivalDate: "2024-05-01"}
            login(admin)
            await postProduct(productDue)
            await acquistaProdotto(customer, productDue.model)


            const customerCookie = await login(customer)

            const mockReview = {
                comment: "nice product",
                score: 5
            }

            await request(app)
                .post(`${routePath}/reviews/samsung`)
                .set("Cookie", customerCookie)
                .send(mockReview)
                .expect(200)



            await request(app)
                .delete(`${routePath}/reviews/samsung`)
                .set("Cookie", customerCookie)
                .expect(200)
            await login(admin);
            const reviews = await request(app)
                .get(`${routePath}/reviews/samsung`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(reviews.body).toHaveLength(0)
        })

        test("it should fail if user is not Customer", async () => {

            await request(app)
                .delete(`${routePath}/reviews/Iphone13`)
                .set("Cookie", adminCookie)
                .expect(401)
        })


        test("it should fail if model string is empty or model doesn't exist", async () => {

            const customerCookie = await login(customer)
            await request(app)
                .delete(`${routePath}/reviews/`)
                .set("Cookie", customerCookie)
                .expect(401)

            await request(app)
                .delete(`${routePath}/reviews/Iphone`)
                .set("Cookie", customerCookie)
                .expect(404)
                
        })

    })

    describe("DELETE /reviews/:model/all", () => {

        test("it should return 200 success code", async () => {

            const productTre = {model: "nokia", category: "Smartphone", quantity: 10, details: "very good!", sellingPrice: 200, arrivalDate: "2024-05-01"}
            login(admin)
            await postProduct(productTre)
            await acquistaProdotto(customer, productTre.model)

            const customerCookie = await login(customer)
            const review2 = {
                comment: "bad product",
                score: 1
            }
            await request(app)
                .post(`${routePath}/reviews/nokia`)
                .set("Cookie", customerCookie)
                .send(review2)
                .expect(200)
            
            await request(app)
                .delete(`${routePath}/reviews/nokia/all`)
                .set("Cookie", adminCookie)
                .expect(200)

            const reviews = await request(app)
                .get(`${routePath}/reviews/nokia`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(0)
        })

        test("it should fail if user is not Admin or Manager", async () => {

            await request(app)
                .delete(`${routePath}/reviews/Iphone13/all`)
                .set("Cookie", customerCookie)
                .expect(401)

        })

        test("it should fail if model string is empty or model doesn't exist", async () => {

            await request(app)
                .delete(`${routePath}/reviews//all`)
                .set("Cookie", adminCookie)
                .expect(401)

            await request(app)
                .delete(`${routePath}/reviews/Iphone/all`)
                .set("Cookie", adminCookie)
                .expect(404)
                
        })
    })

    describe("DELETE /reviews/", () => {

        test("it should return 200 success code", async () => {
            const review2 = {
                comment: "bad product",
                score: 1
            }
            const product2 = {
                model: "Iphone14",
                category: "Smartphone", quantity: 10,
                details: "very good!", sellingPrice: 200,
                arrivalDate: "2024-05-01"
            }
            const product3 = {
                model: "Lenovo",
                category: "Smartphone", quantity: 10,
                details: "very good!", sellingPrice: 200,
                arrivalDate: "2024-05-01"
            }
            await login(admin);
            await postProduct(product2)
            await postProduct(product3)
            await acquistaProdotto(customer, product2.model)
            await acquistaProdotto(customer, product3.model)
            await login(customer)
            await request(app)
                .post(`${routePath}/reviews/Iphone14`)
                .set("Cookie", customerCookie)
                .send(review2)
                .expect(200)
            
            await request(app)
                .post(`${routePath}/reviews/Lenovo`)
                .set("Cookie", customerCookie)
                .send(review2)
                .expect(200)
            await request(app)
                .delete(`${routePath}/reviews/`)
                .set("Cookie", adminCookie)
                .expect(200)
            const reviewsLenovo = await request(app)
                .get(`${routePath}/reviews/Lenovo`)
                .set("Cookie", adminCookie)
                .expect(200)
            const reviewsIphone14 = await request(app)
                .get(`${routePath}/reviews/Iphone14`)
                .set("Cookie", adminCookie)
                .expect(200)
            expect(reviewsLenovo.body).toHaveLength(0)
            expect(reviewsIphone14.body).toHaveLength(0)
        })

        test("it should fail if user is not Admin or Manager", async () => {

            await request(app)
                .delete(`${routePath}/reviews/`)
                .set("Cookie", customerCookie)
                .expect(401)
        })
    })
})