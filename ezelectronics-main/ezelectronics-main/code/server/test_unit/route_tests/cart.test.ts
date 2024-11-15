import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import CartController from "../../src/controllers/cartController"

import {User,Role} from "../../src/components/user";
import { Category } from "../../src/components/product";
import { Cart, ProductInCart } from "../../src/components/cart";

import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";

jest.mock("../../src/controllers/cartController.ts");
jest.mock("../../src/routers/auth");
jest.mock("../../src/helper.ts");


const baseURL = "/ezelectronics";

const testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
const testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")


/* TEST:  GET ezelectronics/carts  */
describe("GET /carts ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo ritorna il carrelo di un logged in user ", async () => {       
        const mockProducts: ProductInCart[] = [{
            model: "iphone",
            quantity: 5,
            category: Category.SMARTPHONE,
            price: 10,
        }, {
            model: "laptop",
            quantity: 5,
            category: Category.LAPTOP,
            price: 2,
        }];

        const finalCart: Cart = {
            id: 1,
            customer: "admin",
            paid: false,
            paymentDate: "",
            total: 60,
            products: mockProducts
        }

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(finalCart);

        const response = await request(app).get(baseURL + "/carts");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(finalCart);    
        
        expect(CartController.prototype.getCart).toHaveBeenCalled();
        expect(CartController.prototype.getCart).toHaveBeenCalledWith(testCustomer);
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).get(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).get(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error getCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCart").mockRejectedValue(new Error());

        const response = await request(app).get(baseURL + "/carts");
        expect(response.status).toBe(500);   
    });


});

/* TEST:  POST ezelectronics/carts  */
describe("POST /carts ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo aggiunta prodotto al carrello", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) })
            }))
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        
        jest.spyOn(CartController.prototype, "addToCart").mockResolvedValue(true);

        const response = await request(app).post(baseURL + "/carts").send({model:"iphone"});
        expect(response.status).toBe(200);

        expect(CartController.prototype.addToCart).toHaveBeenCalled();
        expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testCustomer, "iphone");

    });  
    
    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).post(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).post(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error nessun modello inserito", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });

        const response = await request(app).post(baseURL + "/carts");
        expect(response.status).toBe(422);
    });
    
    test("Test error addToCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            body: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) })
            }))
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        
        jest.spyOn(CartController.prototype, "addToCart").mockRejectedValue(new Error());

        const response = await request(app).post(baseURL + "/carts").send({model:"iphone"});
        expect(response.status).toBe(500);  
    });
});

/* TEST:  PATCH ezelectronics/carts  */
describe("PATCH /carts ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo check-out carrelo di un logged in user ", async () => {    

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

        const response = await request(app).patch(baseURL + "/carts");
        expect(response.status).toBe(200);
        
        expect(CartController.prototype.checkoutCart).toHaveBeenCalled();
        expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testCustomer);
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).patch(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).patch(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error checkoutCart", async () => {    

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValue(new Error());

        const response = await request(app).patch(baseURL + "/carts");
        expect(response.status).toBe(500);
        
    });


});

/* TEST:  GET ezelectronics/carts/history  */
describe("GET /carts/history ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo ritorna il carrelo di un logged in user ", async () => {       
        const mockProducts: ProductInCart[] = [{
            model: "iphone",
            quantity: 5,
            category: Category.SMARTPHONE,
            price: 10,
        }, {
            model: "laptop",
            quantity: 5,
            category: Category.LAPTOP,
            price: 2,
        }];

        const finalCart: Cart[] = [{
            id: 1,
            customer: "admin",
            paid: true,
            paymentDate: "2024-02-02",
            total: 30,
            products: mockProducts
        },{
            id: 5,
            customer: "amdmin",
            paid: false,
            paymentDate: "",
            total: 0,
            products: []
        }]; 

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValue(finalCart);

        const response = await request(app).get(baseURL + "/carts/history");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(finalCart);    
        
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalled();
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testCustomer);
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).get(baseURL + "/carts/history");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).get(baseURL + "/carts/history");
        expect(response.status).toBe(401);   
    });

    test("Test error getCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCustomerCarts").mockRejectedValue(new Error());

        const response = await request(app).get(baseURL + "/carts/history");
        expect(response.status).toBe(500);   
    });
});

/* TEST:  DELETE ezelectronics/carts/products/:model  */
describe("DELETE /carts/products/:model ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo rimozione singolo prodotto dal carrello", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) })
            }))
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        
        jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValue(true);

        const response = await request(app).delete(baseURL + "/carts/products/iphone");
        expect(response.status).toBe(200);

        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalled();
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testCustomer, "iphone");

    });  
    
    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).delete(baseURL + "/carts/products/iphone");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).delete(baseURL + "/carts/products/iphone");
        expect(response.status).toBe(401);   
    });

    test("Test error nessun modello inserito", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => {
                throw new Error("Invalid value");
            }),
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        });

        const response = await request(app).delete(baseURL + "/carts/products/Invalid");
        expect(response.status).toBe(422);
    });
    
    test("Test error removeProductFromCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });
        
        jest.mock('express-validator', () => ({
            param: jest.fn().mockImplementation(() => ({
                isString: () => ({ isLength: () => ({}) })
            }))
        }));
        
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })
        
        jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValue(new Error());

        const response = await request(app).delete(baseURL + "/carts/products/model").send({model:"iphone"});
        expect(response.status).toBe(500);  
    });
});

/* TEST:  DELETE ezelectronics/carts/current */
describe("DELETE /current", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo delete carrello di un logged in user ", async () => {       
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "clearCart").mockResolvedValue(true);

        const response = await request(app).delete(baseURL + "/carts/current");
        expect(response.status).toBe(200);
        
        expect(CartController.prototype.clearCart).toHaveBeenCalled();
        expect(CartController.prototype.clearCart).toHaveBeenCalledWith(testCustomer);
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).delete(baseURL + "/carts/current");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).delete(baseURL + "/carts/current");
        expect(response.status).toBe(401);   
    });

    test("Test error clearCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            req.user= testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementation((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "clearCart").mockRejectedValue(new Error());

        const response = await request(app).delete(baseURL + "/carts/current");
        expect(response.status).toBe(500);   
    });
});

/* TEST:  DELETE ezelectronics/carts */
describe("DELETE / ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo delete tutti i carelli", async () => {       
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValue(true);

        const response = await request(app).delete(baseURL + "/carts");
        expect(response.status).toBe(200);
        
        expect(CartController.prototype.deleteAllCarts).toHaveBeenCalled();
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).delete(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error not Admin or Manager", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).delete(baseURL + "/carts");
        expect(response.status).toBe(401);   
    });

    test("Test error clearCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "deleteAllCarts").mockRejectedValue(new Error());

        const response = await request(app).delete(baseURL + "/carts");
        expect(response.status).toBe(500);   
    });
});

/* TEST:  GET ezelectronics/carts/all  */
describe("GET /carts/all ", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Test successo ritorna tutti i carreli", async () => {       
        const mockProducts: ProductInCart[] = [{
            model: "iphone",
            quantity: 5,
            category: Category.SMARTPHONE,
            price: 10,
        }, {
            model: "laptop",
            quantity: 5,
            category: Category.LAPTOP,
            price: 2,
        }];

        const finalCart: Cart[] = [{
            id: 1,
            customer: "admin",
            paid: true,
            paymentDate: "2024-02-02",
            total: 30,
            products: mockProducts
        },{
            id: 5,
            customer: "customer",
            paid: false,
            paymentDate: "",
            total: 0,
            products: []
        }]; 

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next();
        });


        jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValue(finalCart);

        const response = await request(app).get(baseURL + "/carts/all");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(finalCart);    
        
        expect(CartController.prototype.getAllCarts).toHaveBeenCalled();
    });

    test("Test error user not logged in", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user" });
        });

        const response = await request(app).get(baseURL + "/carts/all");
        expect(response.status).toBe(401);   
    });

    test("Test error not Customer", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        });

        const response = await request(app).get(baseURL + "/carts/all");
        expect(response.status).toBe(401);   
    });

    test("Test error getCart", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getAllCarts").mockRejectedValue(new Error());

        const response = await request(app).get(baseURL + "/carts/all");
        expect(response.status).toBe(500);   
    });
});