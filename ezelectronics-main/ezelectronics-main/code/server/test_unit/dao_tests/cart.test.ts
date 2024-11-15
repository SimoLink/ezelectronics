import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals"

import db from "../../src/db/db"
import { Database } from "sqlite3"
import CartDAO from "../../src/dao/cartDAO"
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../../src/errors/productError"
import { GeneralServerError } from "../../src/errors/generalError"
import { Category, Product } from "../../src/components/product"
import { Cart, ProductInCart } from "../../src/components/cart"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError"

jest.mock("../../src/db/db.ts");

/* TEST: addProduct(customer :string, model :string): Promise<boolean> */
describe("Suite di test per la funzione addProduct", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo aggiunta nuovo prodotto al carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(null); //primo errore, secondo risultato
            return {} as Database;
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, undefined);
            return {} as Database;
        });

        const result = await cartDAO.addProduct('user', 'iphone');
        expect(result).toEqual(true);
    });

    test("test quantità prodotto uguale a 0", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 0
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(EmptyProductStockError);
    });

    test("test general error durante l'aggiornamento del carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 5
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(GeneralServerError);
    });

    test("test successo aggiornamento quantità prodotto già presente nel carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 10
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        const mockOrder = { cart_id: 1, product: "iphone", quantity: 1 };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next();
            return {} as Database;
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, mockOrder);
            return {} as Database;
        });

        const result = await cartDAO.addProduct('user', 'iphone');
        expect(result).toEqual(true);
    });

    test("test general error durante l'inserimento di un nuovo prodotto nel carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 10
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            if (req.includes("INSERT INTO orders")) {
                next(new Error());
            } else {
                next();
            }
            return {} as Database;
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, null);
            return {} as Database;
        });

        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(GeneralServerError);
    });

    test("test error verificaProdotto", async () => {
        jest.spyOn(cartDAO, 'verificaProdotto').mockRejectedValue(new Error());
        
        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(Error);
    });

    test("test error getActiveCart", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, "verificaProdotto").mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockRejectedValue(new Error());
        
        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(Error);
    });

    test("test error db.get", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(); //primo errore, secondo risultato
            return {} as Database;
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(Error);
    });

    test("test error db.run --> update", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 10
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        };

        const mockOrder = { cart_id: 1, product: "iphone", quantity: 1 };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            if (req.includes("update orders set quantity")) {
                next(new Error());
            } else {
                next();
            }
            return {} as Database;
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, mockOrder);
            return {} as Database;
        });

        await expect(cartDAO.addProduct('user', 'iphone')).rejects.toThrow(GeneralServerError);
    });
});

/* TEST:  getActiveCart(customer:string) :Promise<Cart> */
describe("Suite di test per la funzione getActiveCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo per prendere un carrello esistente", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const risultato = await cartDAO.getActiveCart("user");
        expect(risultato).toEqual(mockCart);
    });

    test("test successo per prendere un nuovo carrello", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 0,
            products: []
        }

        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new CartNotFoundError());

        jest.spyOn(db, 'run').mockImplementation(function (req, res, next) {
            next.call({ lastID: 1 }, null);
            return {} as Database;
        });

        const result = await cartDAO.getActiveCart("user");
        expect(result).toEqual(mockCart);
    });

    test("Genirc error db.run per getActiveCart", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new CartNotFoundError());

        jest.spyOn(db, 'run').mockImplementation(function (req, res, next) {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.getActiveCart('user')).rejects.toThrow(GeneralServerError);

    });

    test("Genirc error per getActiveCart", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new Error());
        await expect(cartDAO.getActiveCart('user')).rejects.toThrow(Error);

    })


}
);

/* TEST: getCurrentCart(customer :string) :Promise<Cart> */
describe("Suite di test per la funzione getCurrentCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("test successo carrello già presente", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

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
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: mockProducts
        }

        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);



        const result = await cartDAO.getCurrentCart("user");
        expect(result).toEqual(finalCart);

    });

    test("test successo nuovo carrello", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        const mockProducts: ProductInCart[] = [];

        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);



        const result = await cartDAO.getCurrentCart("user");
        expect(result).toEqual(mockCart);

    });

    test("test successo nuovo carrello", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        const mockProducts: ProductInCart[] = [];

        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);



        const result = await cartDAO.getCurrentCart("user");
        expect(result).toEqual(mockCart);

    });

    test("test successo nuovo carrello", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockRejectedValue(new GeneralServerError());

        await expect(cartDAO.getCurrentCart('user')).rejects.toThrow(GeneralServerError);

    });

    test("test errore getCurrentCart", async () => {
        jest.spyOn(cartDAO, 'getActiveCart').mockRejectedValue(new GeneralServerError());

        await expect(cartDAO.getCurrentCart('user')).rejects.toThrow(GeneralServerError);
    });

    test("test errore getOrdersForCart", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, 'getActiveCart').mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockRejectedValue(new GeneralServerError());

        await expect(cartDAO.getCurrentCart('user')).rejects.toThrow(GeneralServerError);

    });
}
);

/* TEST: getExistingCart(customer : string) : Promise<Cart> */
describe("Suite di test per la funzione getExistingCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo carrello già presente", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, customer: "user", total: 30, payementDate: null });
            return {} as Database;
        });


        const result = await cartDAO.getExistingCart("user");
        expect(result).toEqual(mockCart);

    });

    test("test carrello non presente", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, undefined);
            return {} as Database;
        });


        await expect(cartDAO.getExistingCart('user')).rejects.toThrow(CartNotFoundError);

    });

    test("test general error", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });


        await expect(cartDAO.getExistingCart('user')).rejects.toThrow(GeneralServerError);

    });
    
}
);

/* TEST: checkoutCart(customer:string):Promise<boolean> */
describe("Suite di test per la funzione checkoutCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo check-out carrello", async () => {

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

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

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);
        jest.spyOn(cartDAO, "manageProductInCart").mockResolvedValue(true);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next.call({ changes: 1 }, null); //primo errore, secondo risultato
            return {} as Database;
        });

        const result = await cartDAO.checkoutCart('user');
        expect(result).toEqual(true);
    });

    test("test empty cart error", async () => {

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        const mockProducts: ProductInCart[] = [];

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(EmptyCartError);

    });

    test("test cart not found", async () => {

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

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

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);
        jest.spyOn(cartDAO, "manageProductInCart").mockResolvedValue(true);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next.call({ changes: 0 }, null); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(CartNotFoundError);

    });

    test("test general error", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

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

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);
        jest.spyOn(cartDAO, "manageProductInCart").mockResolvedValue(true);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error()); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(GeneralServerError);
    });

    test("test error getExistingCart", async () => {
        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new CartNotFoundError());

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(CartNotFoundError);
    });

    test("test error getOrdersForCart", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, "getOrdersForCart").mockRejectedValue(new GeneralServerError());

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(GeneralServerError);
    });

    test("test error manageProductInCart", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }

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

        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);
        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);
        jest.spyOn(cartDAO, "manageProductInCart").mockRejectedValue(new Error());

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next.call({ changes: 1 }, null); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.checkoutCart('user')).rejects.toThrow(Error);

    });
});

/* TEST: removeProduct(customer:string, model:string):Promise<boolean> */
describe("Suite di test per la funzione removeProduct", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("test successo rimozione prodotto (con quantity 1) dal carrello esistente", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "iphone", quantity: 1 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(null);
            return {} as Database;
        });

        const result = await cartDAO.removeProduct("user", "iphone");
        expect(result).toEqual(true);
    });

    test("test successo rimozione prodotto (con quantity> 1) dal carrello esistente", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "pc", quantity: 2 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next();
            return {} as Database;
        });

        const result = await cartDAO.removeProduct("user", "pc");
        expect(result).toEqual(true);
    });

    test("test error rimozione prodotto (con quantity< 0) dal carrello esistente", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: -2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "pc", quantity: -2 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(null);
            return {} as Database;
        });

        const result = await cartDAO.removeProduct("user", "pc");
        expect(result).toEqual(true);
    });

    test("test error verificaProdotto", async () => {
        jest.spyOn(cartDAO, 'verificaProdotto').mockRejectedValue(new Error());

        await expect(cartDAO.removeProduct('user', "prova")).rejects.toThrow(Error);
    });

    test("test error getExistingCart", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new Error());

        await expect(cartDAO.removeProduct('user', "prova")).rejects.toThrow(Error);
    });

    test("test error nessun carrello esistente (CartNotFoundError)", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [])
            return {} as Database
        });

        await expect(cartDAO.removeProduct('user', "iphone")).rejects.toThrow(ProductNotInCartError);

    });

    test("test error ProductNotInCartError", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, undefined);
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next();
            return {} as Database;
        });

        await expect(cartDAO.removeProduct('user', "iphone")).rejects.toThrow(ProductNotInCartError);
    });

    test("test error db.all", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(Error);
    });

    test("test error db.get", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(Error);
    });

    test("test error db.run --> update orders (quantity> 1)", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 3 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "iphone", quantity: 3 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(GeneralServerError);
    });

    test("test error db.run --> update carts (quantity> 1)", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 3 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "iphone", quantity: 3 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            if (req.includes("update carts")) {
                next(new Error());
            } else {
                next(null);
            }
            return {} as Database;
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(GeneralServerError);
    });

    test("test error db.run --> update orders (quantity= 1)", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "iphone", quantity: 1 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(GeneralServerError);
    });

    test("test error db.run --> update carts (quantity= 1)", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);
        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1 }, { cart_id: 1, product: "pc", quantity: 2 }])
            return {} as Database
        });

        const mockRemove = jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, { cart_id: 1, product: "iphone", quantity: 1 });
            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            if (req.includes("update carts")) {
                next(new Error());
            } else {
                next();
            }
            return {} as Database;
        });

        await expect(cartDAO.removeProduct("user", "iphone")).rejects.toThrow(GeneralServerError);
    });
}
);

/* TEST: removeCart(customer: string):Promise<boolean> */
describe("Suite di test per la funzione removeCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("test successo rimozione carrello esistente", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next.call({changes:1}, null);
            return {} as Database;
        });

        const result = await cartDAO.removeCart("user");
        expect(result).toEqual(true);
    });

    test("test general error db.run --> delete", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.removeCart('user')).rejects.toThrow(GeneralServerError);

    });

    test("test general error getExistingCart", async () => {
        jest.spyOn(cartDAO, "getExistingCart").mockRejectedValue(new Error());

        await expect(cartDAO.removeCart('user')).rejects.toThrow(Error);
    });

    test("test general error db.run --> update carts", async () => {
        const mockCart: Cart = {
            id: 1,
            customer: "user",
            paid: false,
            paymentDate: null,
            total: 30,
            products: []
        }


        jest.spyOn(cartDAO, "getExistingCart").mockResolvedValue(mockCart);

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            if (req.includes("update carts")) {
                next(new Error());
            } else {
                next();
            }
            return {} as Database;
        });

        await expect(cartDAO.removeCart('user')).rejects.toThrow(TypeError);

    });
});

/* TEST: getPastCarts(customer : string):Promise<Cart[]> */
describe("Suite di test per la funzione getPastCarts", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    test("test successo storico carelli", async () => {
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

        const mockRes: Cart[] = [
            new Cart(1, "user", true, "2024-02-01", 60,
                [{
                    model: "iphone",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 10,
                }, {
                    model: "laptop",
                    quantity: 5,
                    category: Category.LAPTOP,
                    price: 2,
                }]
            )];


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{
                cart_id: 1,
                customer: "user",
                paymentDate: "2024-02-01",
                total: 60,
            }]);

            return {} as Database;
        });


        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);

        const result = await cartDAO.getPastCarts("user");
        expect(result).toEqual(mockRes);
    });

    test("test error db.all", async () => {


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(new Error());

            return {} as Database;
        });


        await expect(cartDAO.getPastCarts('user')).rejects.toThrow(Error);

    });

    test("test error nessun carello", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, []);

            return {} as Database;
        });

        expect(await cartDAO.getPastCarts('user')).toEqual([]);

    });

    test("test error carello senza prodotti", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{
                cart_id: 1,
                customer: "user",
                paymentDate: "2024-02-01",
                total: 60,
            }]);

            return {} as Database;
        });


        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue([]);

        const result = await cartDAO.getPastCarts("user");
        expect(result).toEqual([]);
    });

    test("test error getOrdersForCart", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{
                cart_id: 1,
                customer: "user",
                paymentDate: "2024-02-01",
                total: 60,
            }]);

            return {} as Database;
        });


        jest.spyOn(cartDAO, 'getOrdersForCart').mockRejectedValue(new Error());

        await expect(cartDAO.getPastCarts('user')).rejects.toThrow(Error);
    });


});

/* TEST: getOrdersForCart(id:any):Promise<ProductInCart[]> */
describe("Suite di test per la funzione getOrdersForCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo prodotti nel carello", async () => {
        const mockP1: ProductInCart = {
            model: "iphone",
            quantity: 5,
            category: Category.SMARTPHONE,
            price: 10,
        };

        const mockP2: ProductInCart = {
            model: "laptop",
            quantity: 2,
            category: Category.LAPTOP,
            price: 100,
        };

        const mockResult: ProductInCart[] = [mockP1, mockP2];


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{
                cart_id: 1,
                product: "iphone",
                quantity: 5,
                price: 10,
                category: Category.SMARTPHONE
            }, {
                cart_id: 1,
                product: "laptop",
                quantity: 2,
                price: 100,
                category: Category.LAPTOP
            }]);

            return {} as Database;
        });



        const result = await cartDAO.getOrdersForCart(1);
        expect(result).toEqual(mockResult);
    });

    test("test error db.all", async () => {


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(new Error());

            return {} as Database;
        });


        await expect(cartDAO.getOrdersForCart(1)).rejects.toThrow(Error);

    });

    test("test no prodotti nel carrello", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, []);
            return {} as Database;
        });

        const result = await cartDAO.getOrdersForCart(1);
        expect(result).toEqual(null);
    });

});

/* TEST: getAllCarts():Promise<Cart[]> */
describe("Suite di test per la funzione getAllCarts", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo recupero tutti i carrelli", async () => {
        const mockProducts: ProductInCart[] = [
            {
                model: "iphone",
                quantity: 5,
                category: Category.SMARTPHONE,
                price: 10,
            },
            {
                model: "laptop",
                quantity: 5,
                category: Category.LAPTOP,
                price: 2,
            }
        ];

        const mockResult: Cart = new Cart(1, "user", true, "2024-02-01", 60, mockProducts);


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [
                {
                    cart_id: 1,
                    customer: "user",
                    paymentDate: "2024-02-01",
                    total: 60,
                }
            ]);

            return {} as Database; // Se necessario, puoi sostituirlo con un mock del Database
        });

        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue(mockProducts);

        const result = await cartDAO.getAllCarts();
        expect(result).toEqual([mockResult]);
    });

    test("test error nessun carrello", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, []);

            return {} as Database; // Se necessario, puoi sostituirlo con un mock del Database
        });

        expect(await cartDAO.getAllCarts()).toEqual([]);


    });

    test("test nessun prodotto nel carrello", async () => {
        const mockResult: Cart = new Cart(1, "user", false, null, 60, []);


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [
                {
                    cart_id: 1,
                    customer: "user",
                    paymentDate: null,
                    total: 60,
                }
            ]);

            return {} as Database;
        });

        jest.spyOn(cartDAO, 'getOrdersForCart').mockResolvedValue([]);

        const result = await cartDAO.getAllCarts();
        expect(result).toEqual([mockResult]);
    });

    test("test error db.all", async () => {
        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(new Error());

            return {} as Database;
        });

        await expect(cartDAO.getAllCarts()).rejects.toThrow(GeneralServerError);
    });

    test("test error getOrdersForCart", async () => {
        const mockResult: Cart = new Cart(1, "user", false, null, 60, []);


        jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [
                {
                    cart_id: 1,
                    customer: "user",
                    paymentDate: null,
                    total: 60,
                }
            ]);

            return {} as Database;
        });

        jest.spyOn(cartDAO, 'getOrdersForCart').mockRejectedValue(new Error());

        await expect(cartDAO.getAllCarts()).rejects.toThrow(Error);

    });
});

/* TEST: deleteAllCarts():Promise<boolean> */
describe("Suite di test per la funzione deleteAllCarts", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo elimino tutti i carrelli", async () => {
        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(); //primo errore, secondo risultato
            return {} as Database;
        });

        const result = await cartDAO.deleteAllCarts();
        expect(result).toEqual(true);
    });

    test("test error db.run", async () => {
        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error()); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.deleteAllCarts()).rejects.toThrow(GeneralServerError);
    });
});

/* TEST: deleteOrdersForProduct(product: string):Promise<boolean> */
describe("Suite di test per la funzione deleteOrdersForProduct", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo elimino un prodotto presente in un carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1, price: 10, category: Category.SMARTPHONE }])
            return {} as Database
        });

        jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, {
                cart_id: 1,
                customer: "user",
                paymentDate: null,
                total: 60,
            }
            );

            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(); //primo errore, secondo risultato
            return {} as Database;
        });



        const result = await cartDAO.deleteOrdersForProduct("iphone");
        expect(result).toEqual(true);
    });

    test("test error verificaProdotto", async () => {
        jest.spyOn(cartDAO, 'verificaProdotto').mockRejectedValue(new Error());

        await expect(cartDAO.deleteOrdersForProduct('iphone')).rejects.toThrow(Error);

    });

    test("test error db.all", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(new Error())
            return {} as Database
        });


        await expect(cartDAO.deleteOrdersForProduct('iphone')).rejects.toThrow(Error);

    });

    test("test successo eliminazione prodotto in nessun carrello", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [])
            return {} as Database
        });


        const result = await cartDAO.deleteOrdersForProduct("iphone");
        expect(result).toEqual(true);
    });

    test("test error db.get", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1, price: 10, category: Category.SMARTPHONE }])
            return {} as Database
        });

        jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(new Error());

            return {} as Database;
        });

        await expect(cartDAO.deleteOrdersForProduct('iphone')).rejects.toThrow(Error);
    });

    test("test error db.run", async () => {
        const mockProduct: Product = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8
        };

        jest.spyOn(cartDAO, 'verificaProdotto').mockResolvedValue(mockProduct);

        const mockOrder = jest.spyOn(db, "all").mockImplementation((req, res, next) => {
            next(null, [{ cart_id: 1, product: "iphone", quantity: 1, price: 10, category: Category.SMARTPHONE }])
            return {} as Database
        });

        jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, {
                cart_id: 1,
                customer: "user",
                paymentDate: null,
                total: 60,
            }
            );

            return {} as Database;
        });

        jest.spyOn(db, 'run').mockImplementation((req, res, next) => {
            next(new Error()); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.deleteOrdersForProduct('iphone')).rejects.toThrow(Error);
    });
});

/* TEST: verificaProdotto(model:string):Promise<Product> */
describe("Suite di test per la funzione verificaProdotto", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo verifica prodotto", async () => {
        const mockProduct: Product = {
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 8,
            sellingPrice: 10
        };

        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, mockProduct); //primo errore, secondo risultato
            return {} as Database;
        });

        const result = await cartDAO.verificaProdotto("iphone");
        expect(result).toEqual(mockProduct);
    });

    test("test error db.get", async () => {
        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(new Error()); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.verificaProdotto("iphone")).rejects.toThrow(Error);
    });

    test("test error nessun prodotto trovato nel db", async () => {
        jest.spyOn(db, 'get').mockImplementation((req, res, next) => {
            next(null, undefined); //primo errore, secondo risultato
            return {} as Database;
        });

        await expect(cartDAO.verificaProdotto("iphone")).rejects.toThrow(ProductNotFoundError);
    });
});

/* TEST: manageProductInCart(model :string, quantity:number):Promise<boolean> */
describe("Suite di test per la funzione manageProductInCart", () => {
    let cartDAO: CartDAO;

    beforeEach(() => {
        cartDAO = new CartDAO();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    test("test successo cambio quantità prodotto nel carrello", async () => {
        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 5
        };
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, mockProdotto)
            return {} as Database
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((req, res, next) => {
            next(null)
            return {} as Database
        });

        const result = await cartDAO.manageProductInCart("iphone", 1);
        expect(result).toEqual(true)
    });

    test("test nessun prodotto trovato", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, undefined);
            return {} as Database
        });

        const result = cartDAO.manageProductInCart("iphone", 1);
        await expect(result).rejects.toThrow(new ProductNotFoundError())
    });

    test("test quantità prodotto uguale a zero", async () => {
        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 0
        };
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, mockProdotto);
            return {} as Database
        });

        const result = cartDAO.manageProductInCart("iphone", 1);
        await expect(result).rejects.toThrow(new EmptyProductStockError())
    });

    test("test quantità maggiore alla quantità del prodotto", async () => {
        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 3
        };
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, mockProdotto);
            return {} as Database
        });

        const result = cartDAO.manageProductInCart("iphone", 4);
        await expect(result).rejects.toThrow(new LowProductStockError())
    });

    test("test error db.get", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database
        });

        await expect(cartDAO.manageProductInCart("iphone", 1)).rejects.toThrow(GeneralServerError);
    });

    test("test successo cambio quantità prodotto nel carrello", async () => {
        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 5
        };
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((req, res, next) => {
            next(null, mockProdotto)
            return {} as Database
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((req, res, next) => {
            next(new Error());
            return {} as Database;
        });

        await expect(cartDAO.manageProductInCart("iphone", 1)).rejects.toThrow(GeneralServerError);
    });
});