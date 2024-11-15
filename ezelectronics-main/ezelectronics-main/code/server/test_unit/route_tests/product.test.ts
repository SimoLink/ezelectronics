import { describe, test, expect, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"

import { Category } from "../../src/components/product"
import ProductController from "../../src/controllers/productController"
import Authenticator from "../../src/routers/auth"
import ErrorHandler from "../../src/helper"
const baseURL = "/ezelectronics"

jest.mock("../../src/routers/auth")
jest.mock("../../src/controllers/productController")
jest.mock("../../src/helper.ts")

describe("Suite di test per registerProducts", () => {
   test("Dovrebbe tornare un errore 422", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })
        
        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "2001-01-01",
            details: "test",
            quantity: 5
            };

       const response = await request(app).post(baseURL + "/products").send(mockProdotto)
       expect(response.status).toBe(422)
       
       expect(ProductController.prototype.registerProducts).not.toHaveBeenCalled() 
       mockIsLoggedIn.mockRestore();
       mockIsAdminOrManager.mockRestore();
       mockValidator.mockRestore();
   });

    test("Dovrebbe restituire un 200 success code", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "2001-01-01",
            details: "test",
            quantity: 5
            };
        const mockRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce(undefined) 
        const response = await request(app).post(baseURL + "/products").send(mockProdotto) 
        expect(response.status).toBe(200)

        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1) 
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(mockProdotto.model, mockProdotto.category, mockProdotto.quantity, mockProdotto.details, mockProdotto.sellingPrice, mockProdotto.arrivalDate);
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockRegisterProducts.mockRestore();
        mockValidator.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const mockProdotto = {
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "2001-01-01",
            details: "test",
            quantity: 5
            };
        const response = await request(app).post(baseURL + "/products") 
        expect(response.status).toBe(401)

        expect(ProductController.prototype.registerProducts).not.toHaveBeenCalled(); 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
    });

});

describe("Suite di test per getProducts", () => {
    test("Dovrebbe restituire un 200 success code", async () => {
        const mockQuery = {
            grouping: "model", 
            category: "Smartphone", 
            model: "iphone"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).query = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "2001-01-01",
            details: "test",
            quantity: 5
            }];
        const mockGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(mockProdotto) 
        const response = await request(app).get(baseURL + "/products")
        expect(response.status).toBe(200)

        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1) 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockGetProducts.mockRestore();
        mockValidator.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const response = await request(app).get(baseURL + "/products")
        expect(response.status).toBe(401)

        expect(ProductController.prototype.getProducts).not.toHaveBeenCalled() 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();

    });

    test("Dovrebbe tornare un errore 422", async () => {
        const mockQuery = {
            grouping: "model", 
            category: "Smartphone", 
            model: "iphone"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).query = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const response = await request(app).get(baseURL + "/products")
        expect(response.status).toBe(422)

        expect(ProductController.prototype.getProducts).not.toHaveBeenCalled()  
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockValidator.mockRestore();
    });
});

describe("Suite di test per getAvailableProducts", () => {
    test("Dovrebbe restituire un 200 success code", async () => {
        const mockQuery = {
            grouping: "model", 
            category: "Smartphone", 
            model: "iphone"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).query = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "2001-01-01",
            details: "test",
            quantity: 5
            }];
        const mockGetAvailableProducts = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockProdotto) 
        const response = await request(app).get(baseURL + "/products/available")
        expect(response.status).toBe(200)

        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1) 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockGetAvailableProducts.mockRestore();
        mockValidator.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const response = await request(app).get(baseURL + "/products/available")
        expect(response.status).toBe(401)

        expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled() 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();

    });

    test("Dovrebbe tornare un errore 422", async () => {
        const mockQuery = {
            grouping: "model", 
            category: "Smartphone", 
            model: "iphone"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).query = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const response = await request(app).get(baseURL + "/products/available")
        expect(response.status).toBe(422)

        expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled() 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockValidator.mockRestore();
    });
});

describe("Suite di test per deleteAllProducts", () => {
    test("Dovrebbe restituire un 200 success code", async () => {
       
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockDeleteAllProducts = jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true) 
        const response = await request(app).delete(baseURL + "/products")
        expect(response.status).toBe(200)

        expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1) 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockDeleteAllProducts.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const response = await request(app).delete(baseURL + "/products")
        expect(response.status).toBe(401)

        expect(ProductController.prototype.deleteAllProducts).not.toHaveBeenCalled()
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
    });
});

describe("Suite di test per deleteProduct", () => {
    test("Dovrebbe restituire un 200 success code", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockDeleteProduct = jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true) 
        const response = await request(app).delete(baseURL + "/products/:model")
        expect(response.status).toBe(200)

        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1) 
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockDeleteProduct.mockRestore();
        mockValidator.mockRestore();
    });

   test("Dovrebbe tornare un errore 401", async () => {
    const mockQuery = {
        model: "test"
    }
    const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
        (req as any).param = mockQuery;
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const response = await request(app).delete(baseURL + "/products/:model")
        expect(response.status).toBe(401)

        expect(ProductController.prototype.deleteProduct).not.toHaveBeenCalled()
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
    });

    test("Dovrebbe tornare un errore 422", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const response = await request(app).delete(baseURL + "/products/:model")
        expect(response.status).toBe(422)

        expect(ProductController.prototype.deleteProduct).not.toHaveBeenCalled()  
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockValidator.mockRestore();
    });
});

describe("Suite di test per changeProductQuantity", () => {
    test("Dovrebbe tornare un 200 success code", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           changeDate: "2001-01-01"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockProdotto = {
            quantity: 5,
            changeDate: "2001-01-01"
            };

        const mockChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(10) 
        const response = await request(app).patch(baseURL + "/products/:model").send(mockProdotto)
        expect(response.status).toBe(200)

        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1)
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockChangeProductQuantity.mockRestore();
        mockValidator.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           changeDate: "2001-01-01"
        }
    
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const mockProdotto = {
            quantity: 5,
            changeDate: "2001-01-01"
            };

        const response = await request(app).patch(baseURL + "/products/:model").send(mockProdotto)
        expect(response.status).toBe(401)

        expect(ProductController.prototype.changeProductQuantity).not.toHaveBeenCalled();
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
    });

    test("Dovrebbe tornare un errore 422", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           changeDate: "2001-01-01"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const mockProdotto = {
            quantity: 5,
            changeDate: "2001-01-01"
            };

        const response = await request(app).patch(baseURL + "/products/:model").send(mockProdotto)
        expect(response.status).toBe(422)

        expect(ProductController.prototype.changeProductQuantity).not.toHaveBeenCalled()
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockValidator.mockRestore();
    });
});

describe("Suite di test per sellProduct", () => {
    test("Dovrebbe tornare un 200 success code", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           sellingDate: "2001-01-01"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next();
        })

        const mockProdotto = {
            quantity: 5,
            sellingDate: "2001-01-01"
            };

        const mockSellProduct = jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(10) 
        const response = await request(app).patch(baseURL + "/products/:model/sell").send(mockProdotto)
        expect(response.status).toBe(200)

        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1)
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockSellProduct.mockRestore();
        mockValidator.mockRestore();
    });

    test("Dovrebbe tornare un errore 401", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           sellingDate: "2001-01-01"
        }
    
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        })
        
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 })
        })

        const mockProdotto = {
            quantity: 5,
            sellingDate: "2001-01-01"
            };

        const response = await request(app).patch(baseURL + "/products/:model/sell").send(mockProdotto)
        expect(response.status).toBe(401)

        expect(ProductController.prototype.sellProduct).not.toHaveBeenCalled();
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
    });

    test("Dovrebbe tornare un errore 422", async () => {
        const mockQuery = {
            model: "test"
        }
        const mockQuery2 = {
           quantity: 5,
           sellingDate: "2001-01-01"
        }
        const mockIsLoggedIn =  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req: any, res: any, next: any) => {
            (req as any).param = mockQuery;
            (req as any).body = mockQuery2;
            return next()
        })
    
        const mockIsAdminOrManager = jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req: any, res: any, next: any) => {
            return next()
        })

        const mockValidator = jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
        })

        const mockProdotto = {
            quantity: 5,
            sellingDate: "2001-01-01"
            };

        const response = await request(app).patch(baseURL + "/products/:model/sell").send(mockProdotto)
        expect(response.status).toBe(422)

        expect(ProductController.prototype.sellProduct).not.toHaveBeenCalled()
        mockIsLoggedIn.mockRestore();
        mockIsAdminOrManager.mockRestore();
        mockValidator.mockRestore();
    });
});            
        