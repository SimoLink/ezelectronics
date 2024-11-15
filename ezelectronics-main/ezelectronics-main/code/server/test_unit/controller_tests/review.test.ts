import { test, expect, jest } from "@jest/globals"
import reviewDAO from "../../src/dao/reviewDAO"
import ReviewController from "../../src/controllers/reviewController"
import { Role, User } from "../../src/components/user"
import ReviewDAO from "../../src/dao/reviewDAO"
import { ProductReview } from "../../src/components/review"
import { Category } from "../../src/components/product"

jest.mock("../../src/dao/reviewDAO")

test("addReview", async () => { 
    const reviewController = new ReviewController();
    jest.spyOn(reviewDAO.prototype, "addReview").mockResolvedValue(undefined)
    const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")
    const response = await reviewController.addReview("test", mockUser , 5, "test")
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith("test", mockUser , 5, "test");
    expect(response).toBe(undefined); //Check if the response is true
    })

test("getProductReviews", async () => {
    const reviewController = new ReviewController();
    const mockProductReview = new ProductReview("test", "test", 5, "test", "test")
    jest.spyOn(reviewDAO.prototype, "getProductReviews").mockResolvedValue([mockProductReview])

    const response = await reviewController.getProductReviews("test")
    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith("test");
    expect(response).toEqual([mockProductReview]);
})

test("deleteReview", async () => {
    const reviewController = new ReviewController();
    const mockProduct = {
        model: "test",
        category: Category.SMARTPHONE,
        arrivalDate: "05-05-2024",
        details: "test",
        quantity: 5,
        sellingPrice: 5
    }

    const mockUser = new User("test", "test", "test", Role.CUSTOMER,"test", "test")

    jest.spyOn(reviewDAO.prototype, "deleteProductReview").mockResolvedValue(undefined)

    const response = await reviewController.deleteReview("test", mockUser)
    expect(ReviewDAO.prototype.deleteProductReview).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteProductReview).toHaveBeenCalledWith("test",mockUser);
    expect(response).toEqual(undefined);
})

test("deleteReviewsOfProduct", async () => {
    const reviewController = new ReviewController();
    const mockProduct = {
        model: "test",
        category: Category.SMARTPHONE,
        arrivalDate: "05-05-2024",
        details: "test",
        quantity: 5,
        sellingPrice: 5
    }
    jest.spyOn(reviewDAO.prototype, "deleteProductReview").mockResolvedValue(undefined)

    const response = await reviewController.deleteReviewsOfProduct(mockProduct.model)
    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(mockProduct.model);
    expect(response).toEqual(undefined);
})

test("deleteAllReviews", async () => {
    const reviewController = new ReviewController();
    jest.spyOn(reviewDAO.prototype, "deleteAllReviews").mockResolvedValue(undefined)

    const response = await reviewController.deleteAllReviews()
    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledWith();
    expect(response).toEqual(undefined);
})