import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"

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

beforeAll(async () => {
    await cleanup()
    await postUser(admin)
    await postUser(customer)
    adminCookie = await login(admin)
    await postProduct(product)
})

//After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup()
})

describe("POST /products", () => {
        test("it should return 200 success code and add a new product", async () => {
            const mockProduct = {
                model: "Iphone20",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(2)
            let prod = prodotto.body[1]

            expect(prod).toBeDefined() 
            expect(prod.model).toBe(mockProduct.model)
            expect(prod.category).toBe(mockProduct.category)
            expect(prod.quantity).toBe(mockProduct.quantity)
            expect(prod.details).toBe(mockProduct.details)
            expect(prod.sellingPrice).toBe(mockProduct.sellingPrice)
            expect(prod.arrivalDate).toBe(mockProduct.arrivalDate)
        })

        test("it should return error code 401 (Unauthorized)", async () => {
            const mockProduct = {
                model: "Iphone20",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            customerCookie = await login(customer)

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", customerCookie)
                .send(mockProduct)
                .expect(401)
        })

        test("it should return error code 422 (Unprocessable Entity, model empty)", async () => {
            const mockProduct = {
                model: "",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, wrong category)", async () => {
            const mockProduct = {
                model: "Iphone100",
                category: "Test",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, negative quantity)", async () => {
            const mockProduct = {
                model: "Iphone100",
                category: "Smartphone",
                quantity: -5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(422)
        })

        test("it should return 200 success code and add a new product with empty details", async () => {
            const mockProduct = {
                model: "Iphone15",
                category: "Smartphone",
                quantity: 5,
                details: "",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(3)
            let prod = prodotto.body[2]

            expect(prod).toBeDefined() 
            expect(prod.model).toBe(mockProduct.model)
            expect(prod.category).toBe(mockProduct.category)
            expect(prod.quantity).toBe(mockProduct.quantity)
            expect(prod.details).toBe(mockProduct.details)
            expect(prod.sellingPrice).toBe(mockProduct.sellingPrice)
            expect(prod.arrivalDate).toBe(mockProduct.arrivalDate)
        })

        test("it should return error code 422 (Unprocessable Entity, negative selling price)", async () => {
            const mockProduct = {
                model: "Iphone110",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: -900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(422)
        })

        test("it should return error code 409 (ProductAlreadyExistsError)", async () => {
            const mockProduct = {
                model: "Iphone20",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
                arrivalDate: "2024-06-10"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(409)
        })

        test("it should return 200 success code and add a new product with an empty arrivalDate", async () => {
            const mockProduct = {
                model: "Iphone6",
                category: "Smartphone",
                quantity: 5,
                details: "wow!",
                sellingPrice: 900,
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)
                
            expect(prodotto.body).toHaveLength(4)
            let prod = prodotto.body[3]

            expect(prod).toBeDefined() 
            expect(prod.model).toBe(mockProduct.model)
            expect(prod.category).toBe(mockProduct.category)
            expect(prod.quantity).toBe(mockProduct.quantity)
            expect(prod.details).toBe(mockProduct.details)
            expect(prod.sellingPrice).toBe(mockProduct.sellingPrice)
        })
    })

    describe("PATCH /products/:model", () => {
        test("it should return 200 success code and change quantity", async () => {
            
        const mockDati = {
            quantity: 5,
            changeDate: "2024-06-10"
        }

            const response = await request(app)
                .patch(`${routePath}/products/Iphone13`)
                .set("Cookie", adminCookie)
                .send(mockDati)
                .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(4)
            let prod = prodotto.body[0]

            expect(prod).toBeDefined() 
            expect(prod.quantity).toBe(15)
        })

        test("it should return error code 401 (Unauthorized)", async () => {
            
            const mockDati = {
                quantity: 5,
                changeDate: "2024-06-10"
            }

            customerCookie = await login(customer)

                const response = await request(app)
                    .patch(`${routePath}/products/Iphone13`)
                    .set("Cookie", customerCookie)
                    .send(mockDati)
                    .expect(401)
            })

           test("it should return error code 404 (model not exist)", async () => {
            
                const mockDati = {
                    quantity: 5,
                    changeDate: "2024-06-10"
                }
        
                 await request(app)
                        .patch(`${routePath}/products/test`)
                        .set("Cookie", adminCookie)
                        .send(mockDati)
                        .expect(404)

                })

                test("it should return error code 422 (Unprocessable Entity, negative quantity)", async () => {
            
                const mockDati = {
                    quantity: -5,
                    changeDate: "2024-06-10"
                }
        
                 await request(app)
                        .patch(`${routePath}/products/Iphone13`)
                        .set("Cookie", adminCookie)
                        .send(mockDati)
                        .expect(422)

                })

                test("it should return 200 success code and add a new product with an empty changeDate", async () => {
            
                    const mockDati = {
                        quantity: 5,
                    }
            
                     
            const response = await request(app)
            .patch(`${routePath}/products/Iphone20`)
            .set("Cookie", adminCookie)
            .send(mockDati)
            .expect(200)

        const prodotto = await request(app)
            .get(`${routePath}/products/`)
            .set("Cookie", adminCookie)
            .expect(200)

        expect(prodotto.body).toHaveLength(4)
        let prod = prodotto.body[1]

        expect(prod).toBeDefined() 
        expect(prod.quantity).toBe(10)
                    })
    })

        describe("PATCH /products/:model/sell", () => {
        test("it should return 200 success code and check as selled", async () => {
            
        const mockDati = {
            quantity: 5,
            sellingDate: "2024-06-14"
        }

            const response = await request(app)
                .patch(`${routePath}/products/Iphone13/sell`)
                .set("Cookie", adminCookie)
                .send(mockDati)
                .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(4)
            let prod = prodotto.body[0]

            expect(prod).toBeDefined()
            expect(prod.quantity).toBe(10)
        })

        test("it should return error code 401 (Unauthorized)", async () => {
            
            const mockDati = {
                quantity: 5,
                sellingDate: "2024-06-14"
            }

            customerCookie = await login(customer)

                const response = await request(app)
                    .patch(`${routePath}/products/Iphone13/sell`)
                    .set("Cookie", customerCookie)
                    .send(mockDati)
                    .expect(401)
            })

           test("it should return error code 404", async () => {
            
                const mockDati = {
                quantity: 5,
                sellingDate: "2024-06-13"
            }
        
                 await request(app)
                        .patch(`${routePath}/products/test/sell`)
                        .set("Cookie", adminCookie)
                        .send(mockDati)
                        .expect(404)

                })

                test("it should return error code 422 (Unprocessable Entity, negative quantity)", async () => {
            
                    const mockDati = {
                        quantity: -5,
                        sellingDate: "2024-06-14"
                    }
        
                 await request(app)
                        .patch(`${routePath}/products/Iphone13/sell`)
                        .set("Cookie", adminCookie)
                        .send(mockDati)
                        .expect(422)

                })

                test("it should return 200 success code and add a new product with an empty sellingDate", async () => {
            
                    const mockDati = {
                        quantity: 5,
                    }
            
                     
            const response = await request(app)
            .patch(`${routePath}/products/Iphone13/sell`)
            .set("Cookie", adminCookie)
            .send(mockDati)
            .expect(200)

        const prodotto = await request(app)
            .get(`${routePath}/products/`)
            .set("Cookie", adminCookie)
            .expect(200)

        expect(prodotto.body).toHaveLength(4)
        let prod = prodotto.body[0]

        expect(prod).toBeDefined() 
        expect(prod.quantity).toBe(5)
                    })
    })

    describe("GET /products", () => {
        test("it should return 200 success code and get all products", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(4)
            let prod = prodotto.body[0]

            expect(prod).toBeDefined() 
            expect(prod.model).toBe(product.model)
            expect(prod.category).toBe(product.category)
            expect(prod.quantity).toBe(5)
            expect(prod.details).toBe(product.details)
            expect(prod.sellingPrice).toBe(product.sellingPrice)
            expect(prod.arrivalDate).toBe(product.arrivalDate)
        })

        test("it should return error code 401 (Unauthorized)", async () => {

            customerCookie = await login(customer)

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", customerCookie)
                .expect(401)
        })

        test("it should return error code 422 (Unprocessable Entity, wrong grouping)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'Test', category: 'Smartphone' })
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, wrong category)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'category', category: 'Test' })
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, empty model)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'model', category: 'Smartphone', model: "" })
                .expect(422)
        })
    })

    describe("GET /products/available", () => {
        test("it should return 200 success code and get all available products", async () => {

            customerCookie = await login(customer)

            const prodotto = await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", customerCookie)
                .expect(200)

            expect(prodotto.body).toHaveLength(4)
            let prod = prodotto.body[0]

            expect(prod).toBeDefined() 
            expect(prod.model).toBe(product.model)
            expect(prod.category).toBe(product.category)
            expect(prod.quantity).toBe(5)
            expect(prod.details).toBe(product.details)
            expect(prod.sellingPrice).toBe(product.sellingPrice)
            expect(prod.arrivalDate).toBe(product.arrivalDate)
        })

        test("it should return error code 401 (Unauthorized)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/`)
                .set("Cookie", customerCookie)
                .expect(401)
        })

        test("it should return error code 422 (Unprocessable Entity, wrong grouping)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'Test', category: 'Smartphone' })
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, wrong category)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'category', category: 'Test' })
                .expect(422)
        })

        test("it should return error code 422 (Unprocessable Entity, empty model)", async () => {

            const prodotto = await request(app)
                .get(`${routePath}/products/available`)
                .set("Cookie", adminCookie)
                .query({ grouping: 'model', category: 'Smartphone', model: "" })
                .expect(422)
        })
    })

   describe("DELETE /products", () => {
        test("it should return 200 success code and delete all products", async () => {

            await request(app)
            .delete(`${routePath}/products`)
            .set("Cookie", adminCookie)
            .expect(200)

            //mi aspetto che torni una lista vuota
            const prodotto = await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .expect(200)

        })

        test("it should return error code 401 (Unauthorized)", async () => {

            customerCookie = await login(customer)

            await request(app)
            .delete(`${routePath}/products`)
            .set("Cookie", customerCookie)
            .expect(401)

        })
    })

    describe("DELETE /products/:model", () => {
        test("it should return 200 success code and delete that model", async () => {

            const mockProduct = {
                model: "Iphone2",
                category: "Smartphone",
                quantity: 3,
                details: "bellissimo!",
                sellingPrice: 600,
                arrivalDate: "2024-06-08"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(200)

            await request(app)
            .delete(`${routePath}/products/Iphone2`)
            .set("Cookie", adminCookie)
            .expect(200)

            const prodotto = await request(app)
                .get(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .expect(200)
        })

        test("it should return error code 401 (Unauthorized)", async () => {
            const mockProduct = {
                model: "Iphone2",
                category: "Smartphone",
                quantity: 3,
                details: "bellissimo!",
                sellingPrice: 600,
                arrivalDate: "2024-06-08"
            }

            await request(app)
                .post(`${routePath}/products`)
                .set("Cookie", adminCookie)
                .send(mockProduct)
                .expect(200)

            customerCookie = await login(customer)

            await request(app)
            .delete(`${routePath}/products/Iphone2`)
            .set("Cookie", customerCookie)
            .expect(401)
        })

        test("it should return error code 404 (model not exist)", async () => {
            await request(app)
            .delete(`${routePath}/products/test`)
            .set("Cookie", adminCookie)
            .expect(404)
                })
    })