// import db from "src/db/db"
import db from "../db/db"
import {ProductAlreadyExistsError, EmptyProductStockError, ProductNotFoundError, LowProductStockError,SellingDateError,ChangeDateError, ProductSoldError} from "../errors/productError";
import {ConstraintError, GeneralServerError} from "../errors/generalError";
import { Product, Category } from "../components/product";
import dayjs from "dayjs";
import CartDAO from "./cartDAO";
/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void>{
        return new Promise<void>((resolve, reject) => {
            try{
                if(dayjs(arrivalDate).isAfter(dayjs()))  throw new SellingDateError();
            const sql = "INSERT INTO products(model, category, arrivalDate, details, quantity, sellingPrice) VALUES (?, ?, ?, ?, ?, ?)" 
                db.run(sql, [model, category, arrivalDate, details, quantity, sellingPrice], (err: Error | null) => {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed: products.model")) {
                            reject(new ProductAlreadyExistsError)
                        return}
                        reject(err)
                        return
                    }
                    resolve()
                })
            } catch(error) {
                reject(error)
            }
        })
    }


    getProducts(grouping: string | null, category: string | null, model: string | null) : Promise<Product[]>/**Promise<Product[]> */ { 
        return new Promise<Product[]>((resolve,reject) => {
            try {
                // grouping = null, category = null, model = null
                if (!grouping && !category && !model) {
                    let sql: string = "SELECT * FROM products"
                    db.all(sql,[], (err: Error | null, rows: any) => {
                        if (err) reject(err);
                        let products: Product[] = [];
                        if(!rows || rows.length===0) resolve([]);
                        rows.forEach((row: any) => {
                            products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                        })
                        resolve(products);
                    })
                } 

                // grouping = category, category = NOT null, model = null
                else if (grouping === "category" && category && !model) {
                    if (category === "Smartphone" || category === "Laptop" || category === "Appliance") {
                        let sql: string = "SELECT * FROM products WHERE category=?"
                        db.all(sql,[category], (err: Error | null, rows: any) => {
                            if (err) reject(err);
                            let products: Product[] = [];
                            if(!rows || rows.length===0) resolve([]);
                            rows.forEach((row: any) => {
                                products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                            })
                            resolve(products);
                        })
                    } else {
                        reject(new ConstraintError());
                        return;
                    }
                } 

                // grouping = model, category = null, model = NOT null
                else if (grouping === "model" && !category && model) {
                    let sql: string = "SELECT * FROM products WHERE model=?"
                    db.all(sql,[model], (err: Error | null, rows: any) => {
                        if (err) reject(err);
                        let products: Product[] = [];
                        if(!rows || rows.length===0) {
                            return reject(new ProductNotFoundError());}
                        rows.forEach((row: any) => {
                            products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                        })
                        resolve(products);
                    })
                } else {
                    reject(new ConstraintError());
                    return;
                }

            } catch (err) {
                reject(err)
            }
        })
    }

    deleteProduct(model: string) : Promise<Boolean>{
        return new Promise<Boolean>((resolve,reject) => {
            try {
                let dao = new CartDAO();
                dao.deleteOrdersForProduct(model).then(()=>{
                    const sql = "DELETE FROM products WHERE model=?";
                    db.run(sql, [model], (err: Error | null) => {
                        if (err) return reject(err);
                        return resolve(true);
                    })
                }).catch((err)=>reject(err));
            } catch (err) {
                reject(err);
            }
        })
    }

    deleteAllProducts() : Promise<Boolean> {
        return new Promise<Boolean>((resolve,reject) => {
            try {
                const sql = "DELETE FROM products"
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(true)
                })
            } catch (err) {
                reject(err);
            }
        })
    }

    
    getAvailableProducts(grouping: string | null, category: string | null, model: string | null) :Promise<Product[]> { 
        return new Promise<Product[]>((resolve,reject) => {
            try {
                // grouping = null, category = null, model = null
                if (!grouping && !category && !model) {
                    let sql: string = "SELECT * FROM products WHERE quantity > 0"
                    db.all(sql,[], (err: Error | null, rows: any) => {
                        if (err) reject(err);
                        let products: Product[] = [];
                        if(!rows || rows.length===0) reject(new EmptyProductStockError());
                        rows.forEach((row: any) => {
                            products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                        })
                        resolve(products);
                    })
                } 

                // grouping = category, category = NOT null, model = null
                else if (grouping === "category" && category && !model) {
                    if (category === "Smartphone" || category === "Laptop" || category === "Appliance") {
                        let sql: string = "SELECT * FROM products WHERE category=? AND quantity > 0"
                        db.all(sql,[category], (err: Error | null, rows: any) => {
                            if (err) reject(err);
                            let products: Product[] = [];
                            if(!rows || rows.length===0) resolve([]);
                            rows.forEach((row: any) => {
                                products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                            })
                            resolve(products);
                        })
                    } else {
                        reject(new ConstraintError());
                        return;
                    }
                } 

                // grouping = model, category = null, model = NOT null
                else if (grouping === "model" && !category && model) {
                    let sql: string = "SELECT * FROM products WHERE model=?"
                    db.all(sql,[model], (err: Error | null, rows: any) => {
                        if (err) reject(err);
                        let products: Product[] = [];
                        if(!rows || rows.length===0) return reject(new ProductNotFoundError());
                        if(rows[0].quantity < 1) return resolve([]);
                        rows.forEach((row: any) => {
                            products.push(new Product(row.sellingPrice, row.model, row.category, row.arrivalDate, row.details, row.quantity));
                        })
                        resolve(products);
                    })
                } else {
                    reject(new ConstraintError());
                    return;
                }

            } catch (err) {
                reject(err)
            }
        })

    }

    sellProduct(model: string, quantity: number, sellingDate: string | null) :Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                let product = this.getAvailableProducts("model", null, model);
                product.then((prod) => {
                    if(prod.length === 0) return reject(new EmptyProductStockError());
                    let product: Product = prod[0];
                    if (product.quantity - quantity < 0) {
                        return reject( new LowProductStockError());
                    }

                    let arrivalDate = dayjs(product.arrivalDate);
                    let new_sellingDate;
                    if (!sellingDate){
                        new_sellingDate = dayjs();
                    }else {
                        new_sellingDate = dayjs(sellingDate);
                    }

                    if (new_sellingDate.isBefore(arrivalDate)){
                        return reject(new SellingDateError());
                    } 

                    if (new_sellingDate.isAfter(dayjs())) {
                        return reject(new SellingDateError());
                    }
                    const sql = "UPDATE products SET quantity = quantity - ? WHERE model = ?"
                    db.run(sql, [quantity, product.model], (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return
                        }

                        let new_quantity = product.quantity - quantity;
                        resolve(new_quantity);
                    })
                }).catch((err)=>reject(err));
            } catch (err) {
                reject(err);
            }
        })
    }

    changeProductQuantity(model: string, newQuantity: number, changeDate: string | null) /**:Promise<number> */ { 
         return new Promise<number>((resolve, reject) => {
            try {
                let product = this.getProducts("model", null, model);
                product.then((prod) => {
                    let product: Product = prod[0];
                    let arrivalDate = dayjs(product.arrivalDate);
                    let new_changeDate;
                    if (!changeDate){
                        new_changeDate = dayjs();
                    }else {
                        new_changeDate = dayjs(changeDate);
                    }

                    if (new_changeDate.isBefore(arrivalDate)){
                        return reject(new ChangeDateError());
                    } 

                    if (new_changeDate.isAfter(dayjs())) {
                        return reject(new ChangeDateError());
                    }
                    const sql = "UPDATE products SET quantity = quantity + ? WHERE model = ?"
                    db.run(sql, [newQuantity, product.model], (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return
                        }

                        let new_quantity = product.quantity + newQuantity;
                        resolve(new_quantity);
                    })
                }).catch((err)=>reject(err));
            } catch (err) {
                reject(err);
            }
        })
       
    }


}

export default ProductDAO