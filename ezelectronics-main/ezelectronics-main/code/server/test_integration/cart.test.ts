import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"

import request from 'supertest';
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";


import { Category } from "../src/components/product";
import { Cart, ProductInCart } from "../src/components/cart";
import db from "../src/db/db";
import dayjs from "dayjs";


const baseURL = "/ezelectronics";

//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" };
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" };

const secondCustomer= { username: "lverdi", name: "Luigi", surname: "Verdi", password: "psw", role: "Customer" };
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string;
let adminCookie: string;
let secondCustomerCookie: string;



//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests

const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${baseURL}/users`)
        .send(userInfo)
        .expect(200)
};

const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
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

function quantityProduct(modello: string) {
    return new Promise<number>((resolve, reject) => {
        db.get("select * from products where model=?", [modello], (err: Error | null, row: any) => {
            if (err) {
                return reject(err);
            }
            resolve(row.quantity);
        })
    });
}

function createNewCart(x: string){
    return new Promise<number>((resolve, reject) => {
        db.run("INSERT INTO carts (customer, total, paymentDate) VALUES (?, 0, NULL)", [x], function(err:Error|null){
            if(err){
                return reject(reject(err));  
            } 
            resolve(this.lastID);
        });   
    });
}

function countCarts(){
    return new Promise<number>((resolve, reject) => {
        db.all("select * from carts;", [], (err:Error|null, rows:any)=>{
            if(err){
                return reject(reject(err));  
            } 
            resolve(rows.length);
        });
    });
}

async function createDB(){
    db.serialize(() => {
        // Inserimento Prodotti
        db.run(`INSERT INTO products (model, category, arrivalDate, details, quantity, sellingPrice) VALUES 
            ('iPhone13', 'Smartphone', '2024-01-01', 'Latest iPhone model', 10, 999),
            ('GalaxyS21', 'Smartphone', '2024-01-10', 'Samsung Galaxy S21', 2, 799),
            ('MacBookPro', 'Laptop', '2024-02-01', 'Apple MacBook Pro', 5, 1299),
            ('DellXPS13', 'Laptop', '2024-02-10', 'Dell XPS 13', 7, 999),
            ('WashingMachine123', 'Appliance', '2024-06-01', 'High efficiency washing machine', 5, 499.99),
            ('Microwave789', 'Appliance', '2024-06-03', 'Compact microwave oven', 0, 129.99)`);

        // Carrelli e Ordini
        db.run("INSERT INTO carts (cart_id, customer, total, paymentDate) VALUES (1, 'customer', 3896, NULL)");
        db.run(`INSERT INTO orders (cart_id, product, quantity, price, category) VALUES 
            (1, 'iPhone13', 1, 999, 'Smartphone'),
            (1, 'GalaxyS21', 2, 799, 'Smartphone'),
            (1, 'MacBookPro', 1, 1299, 'Laptop')`);

        db.run("INSERT INTO carts (cart_id, customer, total, paymentDate) VALUES (2, 'customer', 999.98, '2024-05-02')");
        db.run("INSERT INTO orders (cart_id, product, quantity, price, category) VALUES (2, 'WashingMachine123', 2, 499.99, 'Appliance')");

        // Carrelli e Ordini
        db.run("INSERT INTO carts (cart_id, customer, total, paymentDate) VALUES (3, 'lverdi', 4296, NULL)");
        db.run(`INSERT INTO orders (cart_id, product, quantity, price, category) VALUES 
            (3, 'DellXPS13', 3, 999, 'Laptop'),
            (3, 'MacBookPro', 1, 1299, 'Laptop')`);

        db.run("INSERT INTO carts (cart_id, customer, total, paymentDate) VALUES (4, 'lverdi', 999, '2024-06-01')");
        db.run("INSERT INTO orders (cart_id, product, quantity, price, category) VALUES (4, 'DellXPS13', 1, 999, 'Laptop')");

        db.run("INSERT INTO carts (cart_id, customer, total, paymentDate) VALUES (5, 'lverdi', 2497.99, '2024-06-12')");
        db.run(`INSERT INTO orders (cart_id, product, quantity, price, category) VALUES 
            (5, 'iPhone13', 2, 999, 'Smartphone'),
            (5, 'WashingMachine123', 1, 499.99,'Appliance')`);
    });
}

/* TEST:  GET ezelectronics/carts  */
describe("GET carts --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo ritorna il carrelo di un logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 2,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 1,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const finalCart: Cart = {
            id: 1,
            customer: "customer",
            paid: false,
            paymentDate: null,
            total: 3896,
            products: mockProducts
        };
                
        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", customerCookie).expect(200);

        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body).toEqual(finalCart);
    });

    test("Test error 401 --> not logged in", async () => {
        const result= await request(app).get(`${baseURL}/carts`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", adminCookie).expect(401);
    });

    test("Test successo ritorna il carrelo vuoto di un logged in user (prima inesistente)", async () => {
        const spyUSer = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(spyUSer);
        const spyCookie = await login(spyUSer);

                
        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", spyCookie).expect(200);

        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body.customer).toEqual("prova");
        expect(result.body.paid).toEqual(false);
        expect(result.body.paymentDate).toEqual(null);
        expect(result.body.total).toEqual(0);  
        expect(result.body.products).toEqual([]);
    });

    test("Test successo ritorna il carrelo vuoto di un logged in user (prima vuoto)", async () => {
        const provaDueUser = { username: "prova2", name: "prova2", surname: "prova2", password: "prova2", role: "Customer" };
        await postUser(provaDueUser);
        const provaDueCookie = await login(provaDueUser);
        
        const n= await createNewCart("prova2");//db.run("INSERT INTO carts (customer, total, paymentDate) VALUES ('prova2', 0, NULL)");
        const finalCart: Cart = {
            id: n,
            customer: "prova2",
            paid: false,
            paymentDate: null,
            total: 0,
            products: []
        };
                
        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", provaDueCookie).expect(200);

        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body).toEqual(finalCart);
    });

});

/* TEST:  POST ezelectronics/carts  */
describe("POST carts --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo aumenta la quantita di un prodotto nel carrello di un logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 2,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 2,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const finalCart: Cart = {
            id: 1,
            customer: "customer",
            paid: false,
            paymentDate: null,
            total: 4895,
            products: mockProducts
        };
        await request(app).post(`${baseURL}/carts`).set("Cookie", customerCookie).send({model: "iPhone13"}).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", customerCookie).expect(200);
        expect(result.body).toEqual(finalCart);
    });

    test("Test successo inserisco un nuovo prodotto nel carrello esistente di un logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "DellXPS13",
            quantity: 3,
            price: 999,
            category: Category.LAPTOP
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        }, {
            model:'WashingMachine123', 
            quantity: 1,
            price: 499.99,
            category: Category.APPLIANCE
        }];

        const finalCart: Cart = {
            id: 3,
            customer: "lverdi",
            paid: false,
            paymentDate: null,
            total: 4795.99,
            products: mockProducts
        };
       

        await request(app).post(`${baseURL}/carts`).set("Cookie", secondCustomerCookie).send({model: "WashingMachine123"}).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", secondCustomerCookie).expect(200);
        expect(result.body).toEqual(finalCart);
    });

    test("Test successo inserisco un nuovo prodotto nel carrello non esistente di un logged in user", async () => {
        const spyUSer = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(spyUSer);
        const spyCookie = await login(spyUSer);

        await request(app).post(`${baseURL}/carts`).set("Cookie", spyCookie).send({model: "iPhone13"}).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", spyCookie).expect(200);
        expect(result.body.customer).toEqual("prova");
        expect(result.body.paid).toEqual(false);
        expect(result.body.paymentDate).toEqual(null);
        expect(result.body.total).toEqual(999);  
        expect(result.body.products).toEqual([{model: "iPhone13",quantity: 1, price: 999, category: Category.SMARTPHONE}]);

    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).post(`${baseURL}/carts`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        await request(app).post(`${baseURL}/carts`).set("Cookie", adminCookie).expect(401);
    });

    test("Test error 404 --> prodotto non esistente", async () => {
        await request(app).post(`${baseURL}/carts`).set("Cookie", customerCookie).send({model: "Pixel6"}).expect(404);
    });

    test("Test error 409 --> prodotto con quantita zero", async () => {
        await request(app).post(`${baseURL}/carts`).set("Cookie", customerCookie).send({model: "Microwave789"}).expect(409);
    });
});

/* TEST:  PATCH ezelectronics/carts  */
describe("PATCH carts --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo check-out carrello", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 2,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 1,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const finalCart: Cart = {
            id: 1,
            customer: "customer",
            paid: true,
            paymentDate: dayjs().format('YYYY-MM-DD'),
            total: 3896,
            products: mockProducts
        };
        await request(app).patch(`${baseURL}/carts`).set("Cookie", customerCookie).expect(200);

        const result= await request(app).get(`${baseURL}/carts/history`).set("Cookie", customerCookie).expect(200);
        expect(result.body[0]).toEqual(finalCart);

        const mac= await quantityProduct("MacBookPro");
        const iphone= await quantityProduct("iPhone13"); 
        const galaxy= await quantityProduct("GalaxyS21");

        expect(mac).toBe(4);
        expect(iphone).toBe(9);
        expect(galaxy).toBe(0);
    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).patch(`${baseURL}/carts`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        await request(app).patch(`${baseURL}/carts`).set("Cookie", adminCookie).expect(401);
    });

    test("Test error 404 --> nessun carrello", async () => {
        const provaUser = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(provaUser);
        const provaCookie = await login(provaUser);
    
        await request(app).patch(`${baseURL}/carts`).set("Cookie", provaCookie).expect(404);
    });
    
    test("Test error 400 --> carrello vuoto", async () => {
        const provaDueUser = { username: "prova2", name: "prova2", surname: "prova2", password: "prova2", role: "Customer" };
        await postUser(provaDueUser);
        const provaDueCookie = await login(provaDueUser);
        
        await createNewCart("prova2");//db.run("INSERT INTO carts (customer, total, paymentDate) VALUES ('prova2', 0, NULL)");
        
        await request(app).patch(`${baseURL}/carts`).set("Cookie", provaDueCookie).expect(400);
    });
    
    test("Test error 409 --> prodotto con quantita 0 nel carrello", async () => {        
        db.run("INSERT INTO orders (cart_id, product, quantity, price, category) VALUES (3, 'Microwave789', 3, 129.99, 'Appliance')");
        await request(app).patch(`${baseURL}/carts`).set("Cookie", secondCustomerCookie).expect(409);
    });

    test("Test error 409 --> prodotto nel carrello con quantita maggiore di quella disponibile", async () => {        
        const provaTreUser = { username: "prova3", name: "prova3", surname: "prova3", password: "prova3", role: "Customer" };
        await postUser(provaTreUser);
        const provaTreCookie = await login(provaTreUser);

        const carrelloID= await createNewCart("prova3");
        db.run(`INSERT INTO orders (cart_id, product, quantity, price, category) VALUES (${carrelloID}, 'iPhone13', 30, 999, 'Smartphone')`);
        await request(app).patch(`${baseURL}/carts`).set("Cookie", provaTreCookie).expect(409);
    });
});

/* TEST:  GET ezelectronics/carts/history  */
describe("GET carts/history --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo recupero storia carrelli logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model:'WashingMachine123', 
            quantity: 1,
            price: 499.99,
            category: Category.APPLIANCE
        }, {
            model: "iPhone13",
            quantity: 2,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const finalCart: Cart[] = [{
            id: 4,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-01",
            total: 999,
            products: [{
                model: "DellXPS13",
                quantity: 1,
                price: 999,
                category: Category.LAPTOP
            }]

        }, {
            id: 5,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-12",
            total: 2497.99,
            products: mockProducts
        }];
        const result= await request(app).get(`${baseURL}/carts/history`).set("Cookie", secondCustomerCookie).expect(200);

        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body).toEqual(finalCart);
    });

    test("Test error 401 --> not logged in", async () => {
        const result= await request(app).get(`${baseURL}/carts/history`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        const result= await request(app).get(`${baseURL}/carts/history`).set("Cookie", adminCookie).expect(401);
    });

});

/* TEST:  DELETE ezelectronics/carts/products/:model  */
describe("DELETE carts/products/:model --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo diminuisci la quantita di un prodotto nel carrello di un logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 1,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 1,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const finalCart: Cart = {
            id: 1,
            customer: "customer",
            paid: false,
            paymentDate: null,
            total: 3097,
            products: mockProducts
        };
        await request(app).delete(`${baseURL}/carts/products/GalaxyS21`).set("Cookie", customerCookie).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", customerCookie).expect(200);
        expect(result.body).toEqual(finalCart);
    });

    test("Test successo rimuovo un prodotto dal carrello di un logged in user", async () => {
        const mockProducts: ProductInCart[] = [{
            model: "DellXPS13",
            quantity: 3,
            price: 999,
            category: Category.LAPTOP
        }];

        const finalCart: Cart = {
            id: 3,
            customer: "lverdi",
            paid: false,
            paymentDate: null,
            total: 2997,
            products: mockProducts
        };


        await request(app).delete(`${baseURL}/carts/products/MacBookPro`).set("Cookie", secondCustomerCookie).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", secondCustomerCookie).expect(200);
        expect(result.body).toEqual(finalCart);
    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).delete(`${baseURL}/carts/products/GalaxyS21`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        await request(app).delete(`${baseURL}/carts/products/GalaxyS21`).set("Cookie", adminCookie).expect(401);
    });

    test("Test error 404 --> modello non nel cartello del logged in user", async() =>{
        await request(app).delete(`${baseURL}/carts/products/DellXPS13`).set("Cookie", customerCookie).expect(404);
    });

    test("Test error 404 --> nessun carrello", async () => {
        const provaUser = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(provaUser);
        const provaCookie = await login(provaUser);
    
        await request(app).delete(`${baseURL}/carts/products/iPhone13`).set("Cookie", provaCookie).expect(404);
    });
    
    test("Test error 404 --> carrello vuoto", async () => {
        const provaDueUser = { username: "prova2", name: "prova2", surname: "prova2", password: "prova2", role: "Customer" };
        await postUser(provaDueUser);
        const provaDueCookie = await login(provaDueUser);
        
        await createNewCart("prova2");//db.run("INSERT INTO carts (customer, total, paymentDate) VALUES ('prova2', 0, NULL)");
        
        await request(app).delete(`${baseURL}/carts/products/iPhone13`).set("Cookie", provaDueCookie).expect(404);
    });
    
    test("Test error 404 --> prodotto  inesistente", async () => {     
        await request(app).delete(`${baseURL}/carts/products/iPhone15`).set("Cookie", customerCookie).expect(404);
    });

});

/* TEST:  DELETE ezelectronics/carts/current  */
describe("DELETE carts/current --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test successo rimozione carrello di un logged in user", async () => {
        await request(app).delete(`${baseURL}/carts/current`).set("Cookie", customerCookie).expect(200);        

        const result= await request(app).get(`${baseURL}/carts`).set("Cookie", customerCookie).expect(200);
        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body.customer).toEqual("customer");
        expect(result.body.paid).toEqual(false);
        expect(result.body.paymentDate).toEqual(null);
        expect(result.body.total).toEqual(0);  
        expect(result.body.products).toEqual([]);
    });

    test("Test error 404 --> nessun carrello", async () => {
        const provaUser = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(provaUser);
        const provaCookie = await login(provaUser);
    
        await request(app).delete(`${baseURL}/carts/current`).set("Cookie", provaCookie).expect(404);
    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).delete(`${baseURL}/carts/current`).expect(401);
    });

    test("Test error 401 --> not Customer", async () => {
        await request(app).delete(`${baseURL}/carts/current`).set("Cookie", adminCookie).expect(401);
    });

});

/* TEST:  DELETE ezelectronics/carts  */
describe("DELETE carts --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).delete(`${baseURL}/carts`).expect(401);
    });

    test("Test error 401 --> not Admin or Manager", async () => {
        await request(app).delete(`${baseURL}/carts`).set("Cookie", customerCookie).expect(401);
    });

    test("Test successo rimozione di tutti i carrelli (admin)", async () => {
        const spyUSer = { username: "prova", name: "prova", surname: "prova", password: "prova", role: "Customer" };
        await postUser(spyUSer);
        await createNewCart("prova");//db.run("INSERT INTO carts (customer, total, paymentDate) VALUES ('prova', 0, NULL)");

        await request(app).delete(`${baseURL}/carts`).set("Cookie", adminCookie).expect(200);
        const res= await countCarts();
        expect(res).toBe(0);
    });

    test("Test successo rimozione di tutti i carrelli (manager)", async () => {
        // Creo un manager 
        const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" };
        await postUser(manager);
        const managerCookie= await login(manager);
        // Faccio in modo di avere almeno un elemento nel db 
        const provaDueUser = { username: "prova2", name: "prova2", surname: "prova2", password: "prova2", role: "Customer" };
        await postUser(provaDueUser);
        await createNewCart("prova2")//db.run("INSERT INTO carts (customer, total, paymentDate) VALUES ('prova2', 0, NULL)");


        await request(app).delete(`${baseURL}/carts`).set("Cookie", managerCookie).expect(200);
        const res= await countCarts();
        expect(res).toBe(0);
    });

});

/* TEST:  GET ezelectronics/carts/all  */
describe("GET carts/all --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        await postUser(customer);
        await postUser(admin);
        await postUser(secondCustomer);
        await createDB();
        customerCookie = await login(customer);
        adminCookie = await login(admin);
        secondCustomerCookie= await login(secondCustomer);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test error 401 --> not logged in", async () => {
        await request(app).get(`${baseURL}/carts/all`).expect(401);
    });

    test("Test error 401 --> not Admin or Manager", async () => {
        await request(app).get(`${baseURL}/carts/all`).set("Cookie", customerCookie).expect(401);
    });

    test("Test successo rimozione di tutti i carrelli (admin)", async () => {
        const mockP1: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 2,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 1,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const cart1: Cart = {
            id: 1,
            customer: "customer",
            paid: false,
            paymentDate: null,
            total: 3896,
            products: mockP1
        };

        const mockP2: ProductInCart[] = [{
            model: "DellXPS13",
            quantity: 3,
            price: 999,
            category: Category.LAPTOP
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        }];

        const cart2: Cart={
            id: 2,
            customer: "customer",
            paid: true,
            paymentDate: "2024-05-02",
            total: 999.98,
            products: [{model:'WashingMachine123',quantity: 2,price: 499.99,category: Category.APPLIANCE}]
        };

        const cart3: Cart = {
            id: 3,
            customer: "lverdi",
            paid: false,
            paymentDate: null,
            total: 4296,
            products: mockP2
        };

        const cart4: Cart={
            id: 4,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-01",
            total: 999,
            products: [{model:"DellXPS13",quantity:1,price: 999,category: Category.LAPTOP}]
        };

        const cart5: Cart={
            id: 5,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-12",
            total: 2497.99,
            products: [{model:'WashingMachine123',quantity: 1,price: 499.99,category: Category.APPLIANCE}, {model: "iPhone13",quantity: 2,price: 999,category: Category.SMARTPHONE}]
        };
        const finalCart: Cart[]=[cart1, cart2, cart3, cart4, cart5];      

        const result= await request(app).get(`${baseURL}/carts/all`).set("Cookie", adminCookie).expect(200);
        
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body).toEqual(finalCart);
    });

    test("Test successo rimozione di tutti i carrelli (manager)", async () => {
        const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" };
        await postUser(manager);
        const managerCookie= await login(manager);

        const mockP1: ProductInCart[] = [{
            model: "GalaxyS21",
            quantity: 2,
            price: 799,
            category: Category.SMARTPHONE
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        },{
            model: "iPhone13",
            quantity: 1,
            price: 999,
            category: Category.SMARTPHONE
        }];

        const cart1: Cart = {
            id: 1,
            customer: "customer",
            paid: false,
            paymentDate: null,
            total: 3896,
            products: mockP1
        };

        const mockP2: ProductInCart[] = [{
            model: "DellXPS13",
            quantity: 3,
            price: 999,
            category: Category.LAPTOP
        }, {
            model: "MacBookPro",
            quantity: 1,
            price: 1299,
            category: Category.LAPTOP
        }];

        const cart2: Cart={
            id: 2,
            customer: "customer",
            paid: true,
            paymentDate: "2024-05-02",
            total: 999.98,
            products: [{model:'WashingMachine123',quantity: 2,price: 499.99,category: Category.APPLIANCE}]
        };

        const cart3: Cart = {
            id: 3,
            customer: "lverdi",
            paid: false,
            paymentDate: null,
            total: 4296,
            products: mockP2
        };

        const cart4: Cart={
            id: 4,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-01",
            total: 999,
            products: [{model:"DellXPS13",quantity: 1,price: 999,category: Category.LAPTOP}]
        };

        const cart5: Cart={
            id: 5,
            customer: "lverdi",
            paid: true,
            paymentDate: "2024-06-12",
            total: 2497.99,
            products: [{model:'WashingMachine123',quantity: 1,price: 499.99,category: Category.APPLIANCE}, {model: "iPhone13",quantity:2, price: 999, category: Category.SMARTPHONE}]
        };
        const finalCart: Cart[]=[cart1, cart2, cart3, cart4, cart5];  
        
        const result= await request(app).get(`${baseURL}/carts/all`).set("Cookie", managerCookie).expect(200);
        expect(result).toBeDefined() //We expect the user we have created to exist in the array. The parameter should also be equal to those we have sent
        expect(result.body).toEqual(finalCart);
    });
});