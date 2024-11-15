import { describe, test, expect, jest, beforeEach, afterEach } from "@jest/globals"

import CartDAO from "../../src/dao/cartDAO"
import CartController from "../../src/controllers/cartController"
import {User,Role} from "../../src/components/user";

import { Category } from "../../src/components/product"
import { Cart, ProductInCart } from "../../src/components/cart"

jest.mock("../../src/dao/cartDAO.ts");

/* TEST: addToCart(user: User, product: string): Promise<Boolean> */
describe("Suite di test per la funzione addToCart", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo aggiungo un prodotto al carrello", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        jest.spyOn(CartDAO.prototype, 'addProduct').mockResolvedValue(true);


        const result = await controller.addToCart(testAdmin, "iphone");
        expect(result).toEqual(true);
    });
});

/* TEST: getCart(user: User) :Promise<Cart> */
describe("Suite di test per la funzione getCart", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo recupero carrello attivo", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        
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
            total: 30,
            products: mockProducts
        } 
        

        jest.spyOn(CartDAO.prototype, 'getCurrentCart').mockResolvedValue(finalCart);

        const result = await controller.getCart(testAdmin);
        expect(result).toEqual(finalCart);
    });
});

/* TEST: checkoutCart(user: User) :Promise<Boolean> */
describe("Suite di test per la funzione checkoutCart", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo aggiungo un prdotto al carrello", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        jest.spyOn(CartDAO.prototype, 'checkoutCart').mockResolvedValue(true);


        const result = await controller.checkoutCart(testAdmin);
        expect(result).toEqual(true);
    });
});

/* TEST: getCustomerCarts(user: User):Promise<Cart[]>  */
describe("Suite di test per la funzione getCustomerCarts", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo recupero carrello utente", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        
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
            customer: "admin",
            paid: false,
            paymentDate: "",
            total: 0,
            products: []
        }]; 
        

        jest.spyOn(CartDAO.prototype, 'getPastCarts').mockResolvedValue(finalCart);

        const result = await controller.getCustomerCarts(testAdmin);
        expect(result).toEqual(finalCart);
    });
});

/* TEST: removeProductFromCart(user: User, product: string) :Promise<Boolean> */
describe("Suite di test per la funzione removeProductFromCart", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo rimozione prodotto dal carrello", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        jest.spyOn(CartDAO.prototype, 'removeProduct').mockResolvedValue(true);


        const result = await controller.removeProductFromCart(testAdmin, "iphone");
        expect(result).toEqual(true);
    });
});

/* TEST: clearCart(user: User) :Promise<Boolean> */
describe("Suite di test per la funzione clearCart", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo rimozione carrello", async () => {
        const testAdmin: User = new User("admin", "admin", "admin", Role.ADMIN, "", "")
        jest.spyOn(CartDAO.prototype, 'removeCart').mockResolvedValue(true);


        const result = await controller.clearCart(testAdmin);
        expect(result).toEqual(true);
    });
});

/* TEST: deleteAllCarts() :Promise<Boolean> */
describe("Suite di test per la funzione deleteAllCarts", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo rimozione carrello", async () => {
        jest.spyOn(CartDAO.prototype, 'deleteAllCarts').mockResolvedValue(true);


        const result = await controller.deleteAllCarts();
        expect(result).toEqual(true);
    });
});

/* TEST: getAllCarts() :Promise<Cart[]>  */
describe("Suite di test per la funzione getAllCarts", () => {
    let controller: CartController;

    beforeEach(() => {
        controller = new CartController();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("test successo recupero carrello utente", async () => {
        
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
            customer: "user",
            paid: false,
            paymentDate: "",
            total: 0,
            products: []
        }] 
        

        jest.spyOn(CartDAO.prototype, 'getAllCarts').mockResolvedValue(finalCart);

        const result = await controller.getAllCarts();
        expect(result).toEqual(finalCart);
    });
});
