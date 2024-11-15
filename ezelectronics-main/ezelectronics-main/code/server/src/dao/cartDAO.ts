import { GeneralServerError } from "../errors/generalError";
import { Cart, ProductInCart } from "../components/cart";
import db from "../db/db"
import { CartNotFoundError, ProductNotInCartError, EmptyCartError } from "../errors/cartError";
import dayjs from "dayjs";
import UserDAO from "./userDAO";
import { LowProductStockError, ProductNotFoundError } from "../errors/productError";
import { EmptyProductStockError } from "../errors/productError";
import { Product } from "../components/product";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    addProduct(customer :string, model :string): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.verificaProdotto(model).then((product)=>{
                if(product.quantity < 1) return reject(new EmptyProductStockError());
                this.getActiveCart(customer).then((res)=>{
                    db.run("update carts set total = total + ? where cart_id = ?;", [product.sellingPrice, res.id], (err: Error | null) => {
                        if (err) {
                            return reject(new GeneralServerError());
                        }
                        db.get("select * from orders where cart_id = ? and product = ?;", [res.id, product.model], (err2: Error | null, row2: any) =>{
                            if(err2) return reject(new GeneralServerError());
                            else if(!row2){
                                db.run("INSERT INTO orders (cart_id, product, quantity, price, category) VALUES (?, ?, 1, ?, ?);", [res.id, product.model, product.sellingPrice, product.category], (err3: Error|null) => {
                                    if(err3) return reject(new GeneralServerError());
                                    return resolve(true);
                                });
                            }else{
                                db.run("update orders set quantity = quantity + 1 where cart_id = ? and product = ?;", [row2.cart_id, product.model], (err: Error | null) => {
                                    if(err) return reject(new GeneralServerError());
                                    return resolve(true);
                                });
                            }
                        });
                    });
                }).catch(err=> reject(err));
            }).catch(err=>reject(err));
        });        
    }


    getActiveCart(customer:string) :Promise<Cart>{
        return new Promise((resolve, reject)=>{
            this.getExistingCart(customer).then((cart)=>resolve(cart)).catch((err)=>{
                if(err instanceof CartNotFoundError){
                    db.run("INSERT INTO carts (customer, total, paymentDate) VALUES (?, 0, ?);", [customer, null], function(err:Error|null){
                        if(err) return reject(new GeneralServerError());
                        return resolve(new Cart(this.lastID, customer, false, null, 0, []));
                    });   
                }
                else{
                    return reject(err);
                }
            });
        });
    }


    getCurrentCart(customer :string) :Promise<Cart>{
        return new Promise((resolve, reject)=>{
            this.getActiveCart(customer).then((result) => { 
                this.getOrdersForCart(result.id).then((products)=>{
                    if(!products || products.length === 0){
                        return resolve(new Cart(result.id, customer, false, null, result.total, []));
                    }
                    return resolve(new Cart(result.id, customer, false, null, result.total, products));
                }).catch(err => reject(err));           
            }).catch(err => reject(err));
        });
    }



    getExistingCart(customer : string) : Promise<Cart>{
        return new Promise((resolve, reject)=>{
            db.get("Select * from carts where customer = ? and paymentDate is null;", [customer], (err: Error | null, row :any)=>{
                if(err) return reject(new GeneralServerError());
                if(!row) return reject(new CartNotFoundError());
                resolve(new Cart(row.cart_id, customer, false, null, row.total, []));
            });
        });
    }

    checkoutCart(customer:string):Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.getExistingCart(customer).then((cart)=>{
                this.getOrdersForCart(cart.id).then((products)=>{
                    if(!products || products.length===0){
                        return reject(new EmptyCartError());
                    }
                    let promises = products.map((order)=>{
                        return new Promise((innerResolve, innerReject)=>{
                            this.manageProductInCart(order.model, order.quantity).then(()=>{
                                innerResolve(true);
                            }).catch(err=>innerReject(err));
                        });
                    });
                    Promise.all(promises).then(()=>{
                        db.run("update carts set paymentDate = ? where cart_id = ?", [dayjs().format("YYYY-MM-DD"), cart.id], function (err:Error|null){
                            if(err) return reject(new GeneralServerError());
                            if(this.changes===0) return reject(new CartNotFoundError());
                            return resolve(true);
                        });
                    }).catch(err=>reject(err));
                }).catch(err=>reject(err));
            }).catch(err=>reject(err));
        });
    }


    removeProduct(customer:string, model:string):Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.verificaProdotto(model).then((product)=>{
                this.getExistingCart(customer).then((cart)=>{
                    db.all("select * from orders where cart_id = ?", [cart.id], (err:Error|null, lines:any)=>{
                        if(err) return reject(err);
                        if(!lines || lines.length===0) return reject(new ProductNotInCartError());
                        db.get("select * from orders where cart_id = ? and product = ?;", [cart.id, product.model], (err:Error|null, res:any)=>{
                            if(err) return reject(new GeneralServerError());
                            if(!res) return reject(new ProductNotInCartError());
                            if(res.quantity>1){
                                db.run("update orders set quantity = quantity-1 where cart_id = ? and product = ?;", [cart.id, product.model], (err:Error|null)=>{
                                    if(err) return reject(new GeneralServerError());
                                    db.run("update carts set total = (total - ?) where cart_id = ?;", [product.sellingPrice, cart.id], (err:Error|null)=>{
                                        if(err) return reject(new GeneralServerError());
                                        return resolve(true);
                                    });
                                });
                            }else{
                                db.run("delete from orders where cart_id = ? and product = ?;", [cart.id, product.model], (err1:Error|null)=>{
                                    if(err1) return reject(new GeneralServerError());
                                    db.run("update carts set total = (total - ?) where cart_id = ?;", [product.sellingPrice, cart.id], (err:Error|null)=>{
                                        if(err) return reject(new GeneralServerError());
                                        return resolve(true);
                                    });
                                });
                            }
                        });
                    });
                }).catch(err=>reject(err));
            }).catch(err=>reject(err));
        });
    }


    removeCart(customer: string):Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.getExistingCart(customer).then((cart)=>{
                db.run("delete from orders where cart_id = ?", [cart.id], function(err:Error|null){
                    if(err) return reject(new GeneralServerError());
                    if(this.changes === 0) return reject(new CartNotFoundError());
                    db.run("update carts set total = 0 where cart_id = ?", [cart.id], (err:Error|null)=>{
                        if(err) return reject(new GeneralServerError());
                        return resolve(true);
                    });
                });
            }).catch(err=>reject(err));
        });
    }

    getPastCarts(customer : string):Promise<Cart[]>{
        return new Promise((resolve, reject)=>{
            db.all("select * from carts where customer = ? and paymentDate is not null;", [customer], (err:Error|null, rows:any)=>{
                if(err) return reject(new GeneralServerError());
                if(!rows || rows.length===0) return resolve([]);
                const promises = rows.map((row: any) => {
                    return new Promise<Cart>((resolveCart, rejectCart) => {
                        this.getOrdersForCart(row.cart_id).then((res)=>{
                            if(!res || res.length === 0){
                                resolveCart(null);
                            }else{
                                resolveCart(new Cart(row.cart_id, customer, row.paymentDate ? true : false, row.paymentDate, row.total, res));
                            }
                        }).catch(err=>rejectCart(err));
                    });
                });
                Promise.all(promises).then(carts => resolve(carts.filter(cart => cart))).catch(err => reject(err));
            });
        });
    }


     getOrdersForCart(id:any):Promise<ProductInCart[]>{
        return new Promise((resolve, reject)=>{
            db.all("SELECT * FROM orders WHERE cart_id = ?;", [id], (err1: Error | null, lines: any) => {
                if (err1) return reject(new GeneralServerError());
                if (!lines || lines.length === 0) return resolve(null);
                const products: ProductInCart[] = [];
                lines.forEach((line: any) => {
                    products.push(new ProductInCart(line.product, line.quantity, line.category, line.price));
                });
                resolve(products);
            });
        });
    }



    getAllCarts():Promise<Cart[]>{
        return new Promise((resolve, reject)=>{
            db.all("select * from carts;", [], (err:Error|null, rows:any)=>{
                if(err) return reject(new GeneralServerError());
                if(!rows || rows.length===0) return resolve([]);
                const promises = rows.map((row: any) => {
                    return new Promise<Cart>((resolveCart, rejectCart) => {
                        this.getOrdersForCart(row.cart_id).then((res)=>{
                            if(!res || res.length === 0){
                                resolveCart(new Cart(row.cart_id, row.customer, row.paymentDate ? true : false, row.paymentDate, row.total, []));
                            }else{
                                resolveCart(new Cart(row.cart_id, row.customer, row.paymentDate ? true : false, row.paymentDate, row.total, res));
                            }
                        }).catch(err=>{
                            rejectCart(err)
                        });
                    });
                });
                Promise.all(promises).then((carts:Cart[]) => resolve(carts.filter((cart:Cart) => cart !== null))).catch(err => reject(err));
            });
        });
    }



    deleteAllCarts():Promise<boolean>{
        return new Promise((resolve, reject)=>{
            db.run("delete from carts", [], (err:Error|null)=>{
                if(err) return reject(new GeneralServerError());
                resolve(true);
            });
        });
    }

    deleteOrdersForProduct(product: string) :Promise<boolean>{
        return new Promise((resolve, reject)=>{
            this.verificaProdotto(product).then(()=>{
                db.all("select * from orders where product = ?;", [product], (err:Error|null, rows:any)=>{
                    if(err) return reject(err);
                    if(!rows || rows.length == 0) return resolve(true);
                    let promises = rows.map((row:any) => {
                        return new Promise((innerResolve, innerReject)=>{
                            db.get("select * from carts where cart_id = ?; and paymentDate is null", [row.cart_id], (err:Error|null, line:any)=>{
                                if(err)  return innerReject(err);
                                if(!line) return innerResolve(true);
                                db.run("update carts set total = ? where cart_id=?;",[line.total-(row.quantity*row.price), row.cart_id], (err:Error|null)=>{
                                    if(err) return innerReject(err);
                                    innerResolve(true);
                                });
                            });
                        });
                    });
                    Promise.all(promises).then(()=>resolve(true)).catch((err)=>reject(err));
                });
            }).catch(err=>reject(err)); 
        });
    }


    verificaProdotto(model:string):Promise<Product>{
        return new Promise((resolve, reject)=>{
            db.get("select * from products where model = ?", [model], (err:Error|null, elem:any)=>{
                if(err) return reject(err);
                if(!elem) return reject(new ProductNotFoundError());
                resolve(new Product(elem.sellingPrice, model, elem.category, elem.arrivalDate, elem.details, elem.quantity));
            });
        });
    }

    manageProductInCart(model :string, quantity:number):Promise<boolean>{
        return new Promise((resolve, reject)=>{
            db.get("select * from products where model = ?", [model], (err:Error|null, product:any)=>{
                if(err) return reject(new GeneralServerError());
                if(!product) return reject(new ProductNotFoundError());
                if(product.quantity === 0) return reject(new EmptyProductStockError());
                if(quantity > product.quantity) return reject(new LowProductStockError());      
                db.run("update products set quantity = quantity - ? where model = ?", [quantity, product.model], (err:Error|null)=>{
                    if(err) return reject(new GeneralServerError());
                    resolve(true);
                });
            });
        });
    }

}

export default CartDAO