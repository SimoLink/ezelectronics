import { test, expect, jest } from "@jest/globals"
import { Category } from "../../src/components/product"

import ProductController from "../../src/controllers/productController";
import ProductDAO from "../../src/dao/productDAO"

    test("registerProducts", async () => { 
        const productController = new ProductController();
        const mockRegisterProducts = jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValue(undefined)
        
        const response = await productController.registerProducts("iphone", "Smartphone", 5, "test", 900, "05/06/2024");
        expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith("iphone", "Smartphone", 5, "test", 900, "05/06/2024");
        expect(response).toBe(undefined);
        mockRegisterProducts.mockRestore();
        });
    
    test("changeProductQuantity", async () => { 
        const productController = new ProductController();
        const mockChangeProductQuantity = jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValue(6)
            
        const response = await productController.changeProductQuantity("iphone", 1, "05/06/2024");
        expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith("iphone", 1, "05/06/2024");
        expect(response).toBe(6);
        mockChangeProductQuantity.mockRestore();
        });
    
    test("sellProduct", async () => { 
        const productController = new ProductController();
        const mockSellProduct = jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValue(4)
                
        const response = await productController.sellProduct("iphone", 1, "05/06/2024");
        expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith("iphone", 1, "05/06/2024");
        expect(response).toBe(4);
        mockSellProduct.mockRestore();
        });
    
    test("getProducts", async () => { 
            const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "01/01/2001",
            details: "test",
            quantity: 5
            }];
            const productController = new ProductController();
            const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValue(mockProdotto)
                    
            const response = await productController.getProducts(null, null, null);
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(null, null, null);
            expect(response).toEqual(mockProdotto);
            mockGetProducts.mockRestore();
            });
    
    test("getAvailableProducts", async () => { 
        const mockProdotto = [{
            sellingPrice: 10,
            model: "iphone",
            category: Category.SMARTPHONE,
            arrivalDate: "01/01/2001",
            details: "test",
            quantity: 5
            }];
            const productController = new ProductController();
            const mockGetAvailableProducts = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValue(mockProdotto)
                        
            const response = await productController.getAvailableProducts(null, null, null);
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(null, null, null);
            expect(response).toEqual(mockProdotto);
            mockGetAvailableProducts.mockRestore();
            });
    
    test("deleteAllProducts", async () => { 
            const productController = new ProductController();
            const mockDeleteAllProducts = jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValue(true);
                            
            const response = await productController.deleteAllProducts();
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith();
            expect(response).toBe(true);
            mockDeleteAllProducts.mockRestore();
            });

    test("deleteProduct", async () => { 
        const productController = new ProductController();
        const mockDeleteProduct = jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValue(true);
                                
        const response = await productController.deleteProduct("iphone");
        expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith("iphone");
        expect(response).toBe(true);
        mockDeleteProduct.mockRestore();
        });