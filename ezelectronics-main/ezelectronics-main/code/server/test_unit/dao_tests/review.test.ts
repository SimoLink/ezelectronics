import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals"

import ReviewController from "../../src/controllers/reviewController"
import ReviewDAO from "../../src/dao/reviewDAO"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { Role, User } from "../../src/components/user"
import { ConstraintError } from "../../src/errors/generalError"
import { ProductReview } from "../../src/components/review"
import { Category, Product } from "../../src/components/product"
import dayjs from "dayjs"
import { ProductNotFoundError } from "../../src/errors/productError"
import ProductDAO from "../../src/dao/productDAO"
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError"
import { error } from "console"
import { Cart, ProductInCart } from "../../src/components/cart"
import UserDAO from "../../src/dao/userDAO"
import CartDAO from "../../src/dao/cartDAO"
import { UserNotFoundError } from "../../src/errors/userError"

describe("1: AddReview", () => {
    test("testing positive outcome", async () => {
    const reviewDao = new ReviewDAO()
    const mockDBGetUser = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        callback(null, undefined)
        return {} as Database
    });
    const mockDBRunReview= jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        if(callback) callback(null)
        return {} as Database
    });
    
    const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValue([new Product(3,"test",Category.SMARTPHONE,null,null,3)])
    const mockVerificaVendita = jest.spyOn(ReviewDAO.prototype, "verificaVenditaProdotto").mockResolvedValueOnce(true)
    const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")


    const result = await reviewDao.addReview("test", mockUser, 5, "test")
    expect(result).toBe(undefined)

    mockDBGetUser.mockRestore
    mockDBRunReview.mockRestore
    mockGetProducts.mockRestore
    mockVerificaVendita.mockRestore
    })

    test("testing missing model, it should return an error", async () => {
        const reviewDao = new ReviewDAO()
        const productDAO = new ProductDAO()

        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([])
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        await expect(reviewDao.addReview(mockProduct.model,mockUser,5,"test")).rejects.toThrow(UserNotFoundError)
        mockGetProducts.mockRestore  
    })

    test("testing missing user, it should return an error", async () => {
        const reviewDao = new ReviewDAO()
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([new Product(3,"test",Category.SMARTPHONE,null,null,3)])
        const mockDBGetUser = jest.spyOn(db,"get").mockImplementation((sql, params, callback) => {
            callback(null, new ProductReview("test", "test", 5, "test", "test"))
            return {} as Database
        })
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockVerificaVendita = jest.spyOn(ReviewDAO.prototype, "verificaVenditaProdotto").mockResolvedValueOnce(true)
        await expect(reviewDao.addReview(mockProduct.model,mockUser,5,"test")).rejects.toThrow(ExistingReviewError)
        mockGetProducts.mockRestore
        mockDBGetUser.mockRestore
    })

    test("generic error from query GET exection", async () => {
        const reviewDAO = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGetUser = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })

        const result = reviewDAO.addReview(mockProduct.model,mockUser,5,"test")
        await expect(result).rejects.toThrow(new Error())
        mockDBGetUser.mockRestore
        mockGetProducts.mockRestore
    })

    test("generic error from query RUN execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGetUser = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })

        const result = reviewDAO.addReview(mockProduct.model,mockUser,5,"test")
        await expect(result).rejects.toThrow(new Error())
        mockDBGetUser.mockRestore
        mockGetProducts.mockRestore
    })

    test("testing if a user has bought the product its reviewing, if not it should return an error", async () => {
        const reviewDAO = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([new Product(3,"test",Category.SMARTPHONE,null,null,3)])
        const mockVerificaVendita = jest.spyOn(ReviewDAO.prototype, "verificaVenditaProdotto").mockResolvedValueOnce(false)
        await expect(reviewDAO.addReview(mockProduct.model,mockUser,5,"test")).rejects.toThrow(Error)
        mockVerificaVendita.mockRestore
        mockGetProducts.mockRestore
    })
})

describe("2: getProductReviews", () => {
    test("testing positive outcome, it should return an array of reviews", async () => {
        const reviewDao = new ReviewDAO()
        const mockReview = [{
            model: "test",
            user: "test",
            score: 5,
            date: "test",
            comment: "test"
        }]
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })
        const expected = new ProductReview("test", "test", 5, "test", "test")
        const result = await reviewDao.getProductReviews("test")
        expect(result).toStrictEqual([expected])
        mockDBAll.mockRestore
    })

    test("generic error from query ALL execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })

        const result = reviewDAO.getProductReviews(mockProduct.model)
        await expect(result).rejects.toThrow(new Error())
        mockDBAll.mockRestore
    })
})

describe("3: deleteProductReview", () => {
    test("testing positive outcome", async () => {
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const result = await reviewDao.deleteProductReview("test", mockUser)
        expect(result).toBe(undefined)
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
        mockDBRun.mockRestore
    })

    test("testing missing model, it should return an error", async () => {
        const reviewDao = new ReviewDAO()
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([])
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        await expect(reviewDao.deleteProductReview("test", mockUser)).rejects.toThrow(ProductNotFoundError)
        mockGetProducts.mockRestore
    })

    test("testing if a review on the model exists, if not it should return an error", async () => {
        const reviewDao = new ReviewDAO()
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, undefined)
            return {} as Database
        })
        await expect(reviewDao.deleteProductReview("test",mockUser)).rejects.toThrow(NoReviewProductError)
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
    })

    test("generic error from query GET execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })

        const result = reviewDAO.deleteProductReview(mockProduct.model,mockUser)
        await expect(result).rejects.toThrow(new Error())
        mockDBGet.mockRestore
        mockGetProducts.mockRestore
    })

    test("generic error from query RUN execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProduct = new Product(3,"test2",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockDBGet = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })
        const result = reviewDAO.deleteProductReview(mockProduct.model,mockUser)
        await expect(result).rejects.toThrow(new Error())
        mockDBGet.mockRestore
        mockGetProducts.mockRestore
        mockDBRun.mockRestore
    })
})

describe("4: deleteReviewsOfProduct", () => {
    test("testing positive outcome", async () => {
        const reviewDao = new ReviewDAO()
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const result = await reviewDao.deleteReviewsOfProduct("test")
        expect(result).toBe(undefined)
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
        mockDBRun.mockRestore
    })

    test("testing missing model, it should return an error", async () => {
        const reviewDao = new ReviewDAO()
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([])
        await expect(reviewDao.deleteReviewsOfProduct("test")).rejects.toThrow(ProductNotFoundError)
        mockGetProducts.mockRestore
    })

    test("testing if a product has at least one review to be deleted", async () => {
        const reviewDao = new ReviewDAO()
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, undefined)
            return {} as Database
        })

        await expect(reviewDao.deleteReviewsOfProduct("test")).rejects.toThrow(NoReviewProductError)
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
    })

    test("generic error from query GET execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })

        await expect(reviewDAO.deleteReviewsOfProduct(mockProduct.model)).rejects.toThrow(new Error())
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
    })

    test("generic error from query RUN execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockProduct = new Product(3,"test",Category.SMARTPHONE,null,null,3)
        const mockGetProducts = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce([mockProduct])
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })
        await expect(reviewDAO.deleteReviewsOfProduct(mockProduct.model)).rejects.toThrow(new Error())
        mockGetProducts.mockRestore
        mockDBGet.mockRestore
        mockDBRun.mockRestore
    })
})

describe("5: deleteAllReviews", () => {

    test("testing positive outcome", async () => {
        const reviewDao = new ReviewDAO()
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null)
            return {} as Database
        })
        const result = await reviewDao.deleteAllReviews()
        expect(result).toBe(undefined)
        mockDBGet.mockRestore
    })

    test("it should be at least one review", async () => {
        const reviewDao = new ReviewDAO()
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, undefined)
            return {} as Database
        })
        expect(await reviewDao.deleteAllReviews()).toEqual(undefined);
        mockDBGet.mockRestore
    })

    test("generic error from query GET execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow(new Error())
        mockDBGet.mockRestore
    })

    test("generic error from query RUN execution", async () => {
        const reviewDAO = new ReviewDAO()
        const mockReview = new ProductReview("test", "test", 5, "test", "test")
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockReview)
            return {} as Database
        })

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error())
            return {} as Database
        })
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow(new Error())
        mockDBGet.mockRestore
        mockDBRun.mockRestore
    })
})

describe("6: verificaVenditaProdotto", () => {

    test("testing positive outcome", async () => {
        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProductInCart = new ProductInCart("test",10,Category.SMARTPHONE,10)
        const mockCarts = new Cart(1, mockUser.username, true, "2021-01-01",10,[mockProductInCart])

        const mockgetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(mockUser)
        const mockGetPastCarts = jest.spyOn(CartDAO.prototype, "getPastCarts").mockResolvedValueOnce([mockCarts])
        const mockGetOrdersFromCart = jest.spyOn(CartDAO.prototype, "getOrdersForCart").mockResolvedValueOnce([mockProductInCart])

        const result = await reviewDao.verificaVenditaProdotto(mockUser.username,mockProductInCart.model)
        expect(result).toBe(true)

        mockgetUserByUsername.mockRestore
        mockGetPastCarts.mockRestore
        mockGetOrdersFromCart.mockRestore
    })

    test("testing getOrdersFromCart failure", async () => {

        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProductInCart = new ProductInCart("test",10,Category.SMARTPHONE,10)
        const mockCarts = new Cart(1, mockUser.username, true, "2021-01-01",10,[mockProductInCart])

        const mockgetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(mockUser)
        const mockGetPastCarts = jest.spyOn(CartDAO.prototype, "getPastCarts").mockResolvedValueOnce([mockCarts])
        const mockGetOrdersFromCart = jest.spyOn(CartDAO.prototype, "getOrdersForCart").mockResolvedValueOnce([])

        const result = await reviewDao.verificaVenditaProdotto(mockUser.username,mockProductInCart.model)
        expect(result).toBe(false)
        
        mockgetUserByUsername.mockRestore
        mockGetPastCarts.mockRestore
        mockGetOrdersFromCart.mockRestore
    })

    test("testing getOrdersFromCart error", async () => {

        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProductInCart = new ProductInCart("test",10,Category.SMARTPHONE,10)
        const mockCarts = new Cart(1, mockUser.username, true, "2021-01-01",10,[mockProductInCart])

        const mockgetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(mockUser)
        const mockGetPastCarts = jest.spyOn(CartDAO.prototype, "getPastCarts").mockResolvedValueOnce([mockCarts])
        const mockGetOrdersFromCart = jest.spyOn(CartDAO.prototype, "getOrdersForCart").mockImplementation(() => {throw new Error()})

        await expect(reviewDao.verificaVenditaProdotto(mockUser.username,mockProductInCart.model)).rejects.toThrow(new Error())
        
        mockgetUserByUsername.mockRestore
        mockGetPastCarts.mockRestore
        mockGetOrdersFromCart.mockRestore
    })

    test("testing getPastCarts error", async () => {

        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProductInCart = new ProductInCart("test",10,Category.SMARTPHONE,10)
        const mockCarts = new Cart(1, mockUser.username, true, "2021-01-01",10,[mockProductInCart])

        const mockgetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(mockUser)
        const mockGetPastCarts = jest.spyOn(CartDAO.prototype, "getPastCarts").mockImplementation(() => {throw new Error()})

        await expect(reviewDao.verificaVenditaProdotto(mockUser.username,mockProductInCart.model)).rejects.toThrow(new Error())
        
        mockgetUserByUsername.mockRestore
        mockGetPastCarts.mockRestore
    })
    
    test("testing getUserByUsername error", async () => {

        const reviewDao = new ReviewDAO()
        const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
        const mockProductInCart = new ProductInCart("test",10,Category.SMARTPHONE,10)
        const mockCarts = new Cart(1, mockUser.username, true, "2021-01-01",10,[mockProductInCart])

        const mockgetUserByUsername = jest.spyOn(UserDAO.prototype, "getUserByUsername").mockImplementation(() => {throw new Error()})

        await expect(reviewDao.verificaVenditaProdotto(mockUser.username,mockProductInCart.model)).rejects.toThrow(new Error())
        
        mockgetUserByUsername.mockRestore
    })
})