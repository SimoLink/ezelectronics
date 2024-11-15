import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import db from "../../src/db/db"
import { Database } from "sqlite3"
import ProductDAO from "../../src/dao/productDAO"
import CartDAO from "../../src/dao/cartDAO"
import { ChangeDateError, EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError, SellingDateError } from "../../src/errors/productError"
import { Category } from "../../src/components/product"
import { ConstraintError } from "../../src/errors/generalError"

jest.mock("../../src/db/db.ts")

describe("Suite di test per la funzione registerProducts", () => {
    test("test successo inserimento prodotto", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        
        const result = await prodotto.registerProducts("iphone19", "Smartphone", 900, "trpp bll", 10, "01/01/2001")
        expect(result).toBe(undefined)
        mockDBRun.mockRestore()
    
    
    });

    test("test errore prodotto già inserito", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("UNIQUE constraint failed: products.model"))
            return {} as Database
        });
        
        const result = prodotto.registerProducts("iphone19", "Smartphone", 900, "trpp bll", 10, "01/01/2001")
        await expect(result).rejects.toThrow(new ProductAlreadyExistsError());
        mockDBRun.mockRestore()
    });
    
    test("test errore generico durante l'esecuzione della query", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        });
        
        const result = prodotto.registerProducts("iphone19", "Smartphone", 900, "trpp bll", 10, "01/01/2001")
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore()
    });
});
    
describe("Suite di test per la funzione getProducts", () => {
    test("test nessun prodotto in stock", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getProducts(null, null, null) 
        expect(await result).toEqual([]);
        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti in stock", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
           sellingPrice: 10,
        model: "iphone",
        category: Category.SMARTPHONE,
        arrivalDate: "01/01/2001",
        details: "test",
        quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getProducts(null, null, null) 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti di una determinata categoria", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
           sellingPrice: 10,
        model: "iphone",
        category: Category.SMARTPHONE,
        arrivalDate: "01/01/2001",
        details: "test",
        quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getProducts("category", Category.SMARTPHONE, null) 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test inserimento categoria inesistente", async () => {
        const prodotto = new ProductDAO()
        
        const result = prodotto.getProducts("category", "categoria_inesistente", null) 
        await expect(result).rejects.toThrow(new ConstraintError());
    });

    test("test nessun prodotto in stock di una specifica categoria", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getProducts("category", Category.SMARTPHONE, null) 
        expect(await result).toEqual([]);        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti di un determinat modello", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
           sellingPrice: 10,
        model: "iphone",
        category: Category.SMARTPHONE,
        arrivalDate: "01/01/2001",
        details: "test",
        quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getProducts("model", null, "iphone") 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test prodotto non trovato", async () => {
        const prodotto = new ProductDAO()
        
        const result = prodotto.getProducts("category", null, null) 
        await expect(result).rejects.toThrow(new ProductNotFoundError());
    });

    test("test nessun prodotto in stock di un determinat modello", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getProducts("model", null, "iphone") 
        await expect(result).rejects.toThrow(new EmptyProductStockError);
        mockDBRun.mockRestore()
    });
});

describe("Suite di test per la funzione deleteProduct", () => {
    test("test successo eliminazione prodotto", async () => {
        
        const prodotto = new ProductDAO()
        const mockDeleteOrdersForProduct = jest.spyOn(CartDAO.prototype, "deleteOrdersForProduct").mockResolvedValueOnce(true);

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        
        const result = await prodotto.deleteProduct("iphone19");
        expect(result).toBe(true)
        mockDBRun.mockRestore()
        mockDeleteOrdersForProduct.mockRestore();

    });

});

describe("Suite di test per la funzione deleteAllProducts", () => {
    test("test successo eliminazione di tutti i prodotti", async () => {
        
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        
        const result = await prodotto.deleteAllProducts();
        expect(result).toBe(true)
        mockDBRun.mockRestore()
    });

    test("test errore generico durante l'esecuzione della query", async () => {
        
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        });
        
        const result = prodotto.deleteAllProducts();
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore()
    });

});

describe("Suite di test per la funzione getAvailableProducts", () => {
    test("test nessun prodotto con quantità >0 disponibile", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getAvailableProducts(null, null, null) 
        await expect(result).rejects.toThrow(new EmptyProductStockError);
        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti con quantità >0", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "01/01/2001",
            details: "test",
            quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getAvailableProducts(null, null, null) 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti di una determinata categoria con quantità >0", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
           sellingPrice: 10,
        model: "iphone",
        category: Category.SMARTPHONE,
        arrivalDate: "01/01/2001",
        details: "test",
        quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getAvailableProducts("category", Category.SMARTPHONE, null) 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test nessun prodotto di una specifica categoria con quantità >0", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getAvailableProducts("category", Category.SMARTPHONE, null) 
        expect(await result).toEqual([]);
        mockDBRun.mockRestore()
    });

    test("test successo visualizzazione prodotti di un determinat modello con quantità >0", async () => {
        const prodotto = new ProductDAO()
        const mockProdotto = [{
           sellingPrice: 10,
        model: "iphone",
        category: Category.SMARTPHONE,
        arrivalDate: "01/01/2001",
        details: "test",
        quantity: 5
        }];

        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockProdotto)
            return {} as Database
        });
        
        const result = await prodotto.getAvailableProducts("model", null, "iphone") 
        expect(result).toEqual(mockProdotto);
        mockDBRun.mockRestore()
    });

    test("test nessun prodotto di un determinat modello con quantità >0", async () => {
        const prodotto = new ProductDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [])
            return {} as Database
        });
        
        const result = prodotto.getAvailableProducts("model", null, "iphone") 
        await expect(result).rejects.toThrow(new EmptyProductStockError);
        mockDBRun.mockRestore()
    });

    test("test inserimento categoria inesistente", async () => {
        const prodotto = new ProductDAO()
        
        const result = prodotto.getAvailableProducts("category", "categoria_inesistente", null) 
        await expect(result).rejects.toThrow(new ConstraintError());
    });

    test("test prodotto non trovato", async () => {
        const prodotto = new ProductDAO()
        
        const result = prodotto.getAvailableProducts("category", null, null) 
        await expect(result).rejects.toThrow(new ProductNotFoundError());
    });

});

describe("Suite di test per la funzione sellProduct", () => {
    test("test successo vendita di un prodotto con data non nulla", async () => {
                
                const prodotto = new ProductDAO()
                const mockProdotto = [{
                    sellingPrice: 10,
                 model: "iphone",
                 category: Category.SMARTPHONE,
                 arrivalDate: "01/01/2001",
                 details: "test",
                 quantity: 5
                 }];
                const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
                const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                    callback(null)
                    return {} as Database
                });
                
                const result = await prodotto.sellProduct("iphone", 1, "03/05/2024");
                expect(result).toBe(4)
                mockDBRun.mockRestore()
                mockGetAvailableProducts.mockRestore();
            });   

            test("test successo vendita di un prodotto con data nulla", async () => {
                
                const prodotto = new ProductDAO()
                const mockProdotto = [{
                    sellingPrice: 10,
                 model: "iphone",
                 category: Category.SMARTPHONE,
                 arrivalDate: "01/01/2001",
                 details: "test",
                 quantity: 5
                 }];
                const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
                const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                    callback(null)
                    return {} as Database
                });
                
                const result = await prodotto.sellProduct("iphone", 1, null);
                expect(result).toBe(4)
                mockDBRun.mockRestore()
                mockGetAvailableProducts.mockRestore();
            });   

    test("test stock inferiore alla quantità da vendere", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "01/01/2001",
            details: "test",
            quantity: 5
            }];
        const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
                
        const result = prodotto.sellProduct("iphone", 6, "03/05/2024");
        await expect(result).rejects.toThrow(new LowProductStockError());
        mockGetAvailableProducts.mockRestore();
    });    
    
    test("test data di acquisto antecedente alla data di arrivo", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2024",
            details: "test",
            quantity: 5
            }];
        const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
                
        const result = prodotto.sellProduct("iphone", 1, "03/05/2024");
        await expect(result).rejects.toThrow(new SellingDateError());
        mockGetAvailableProducts.mockRestore();
    });    

    test("test data di acquisto successiva alla data odierna", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 5
            }];
        const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
                
        const result = prodotto.sellProduct("iphone", 1, "03/05/2050");
        await expect(result).rejects.toThrow(new SellingDateError());
        mockGetAvailableProducts.mockRestore();
    });

    test("test successo vendita di un prodotto con data non nulla", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
         model: "iphone",
         category: Category.SMARTPHONE,
         arrivalDate: "01/01/2001",
         details: "test",
         quantity: 5
         }];
        const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto);
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        });
        
        const result = prodotto.sellProduct("iphone", 1, "03/05/2024");
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore()
        mockGetAvailableProducts.mockRestore();
    });   
});

describe("Suite di test per la funzione changeProductQuantity", () => {
    test("test successo cambio quantità di un prodotto con data non nulla", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
         model: "iphone",
         category: Category.SMARTPHONE,
         arrivalDate: "01/01/2001",
         details: "test",
         quantity: 5
         }];
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(mockProdotto);
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        
        const result = await prodotto.changeProductQuantity("iphone", 1, "03/05/2024");
        expect(result).toBe(6)
        mockDBRun.mockRestore()
        mockGetProducts.mockRestore();
    });  

    test("test successo cambio quantità di un prodotto con data nulla", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
         model: "iphone",
         category: Category.SMARTPHONE,
         arrivalDate: "01/01/2001",
         details: "test",
         quantity: 5
         }];
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(mockProdotto);
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        
        const result = await prodotto.changeProductQuantity("iphone", 1, null);
        expect(result).toBe(6)
        mockDBRun.mockRestore()
        mockGetProducts.mockRestore();
    });  

    test("test nuova data antecedente alla data di arrivo", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2024",
            details: "test",
            quantity: 5
            }];
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(mockProdotto);
                
        const result = prodotto.changeProductQuantity("iphone", 1, "03/05/2024");
        await expect(result).rejects.toThrow(new ChangeDateError());
        mockGetProducts.mockRestore();
    });    

    test("test nuova data successiva alla data odierna", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "04/05/2020",
            details: "test",
            quantity: 5
            }];
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(mockProdotto);
                
        const result = prodotto.changeProductQuantity("iphone", 1, "03/05/2050");
        await expect(result).rejects.toThrow(new ChangeDateError());
        mockGetProducts.mockRestore();
    });    

    test("test errore generico durante l'esecuzione della query", async () => {
                
        const prodotto = new ProductDAO()
        const mockProdotto = [{
            sellingPrice: 10,
         model: "iphone",
         category: Category.SMARTPHONE,
         arrivalDate: "01/01/2001",
         details: "test",
         quantity: 5
         }];
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(mockProdotto);
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error());
            return {} as Database
        });
        
        const result = prodotto.changeProductQuantity("iphone", 1, "03/05/2024");
        await expect(result).rejects.toThrow(new Error());
        mockDBRun.mockRestore()
        mockGetProducts.mockRestore();
    });  

});

