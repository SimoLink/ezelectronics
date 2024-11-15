import db from "../db/db"
import { User } from "../components/user"
import dayjs from "dayjs";

import { ProductReview } from "../components/review";
import { ProductNotFoundError } from "../errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import ProductDAO from "./productDAO";
import CartDAO from "./cartDAO";
import UserDAO from "./userDAO";
import { Cart } from "../components/cart";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    //crea una nuova recensione
    addReview(model: string, user: User, score: number, comment: string) : Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            try {
                // Verifico che il modello esista nel db
                let prodotto = new ProductDAO;
                if(!((await prodotto.getProducts("model", null, model)) instanceof Array) || ((await prodotto.getProducts("model", null, model)).length === 0)){
                    reject(new ProductNotFoundError());
                        return;
                }

                // Verifico che l'utente abbia effettivamente acquistato il modello
                if((await this.verificaVenditaProdotto(user.username, model)) === false && false){
                    reject(new ProductNotFoundError());
                        return;
                }

                // Verifico che l'utente non abbia già scritto una recensione
                const query = "SELECT * FROM reviews WHERE user = ? AND model = ?";
                db.get(query, [ user.username, model ], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }

                    if(row){
                        reject(new ExistingReviewError());
                        return;
                    }
                })

                //creo la data odierna per la recensione
                const today: string = dayjs().format("YYYY-MM-DD");

                //inserisco una nuova recensione
                const insert = "INSERT INTO reviews (model, user, score, date, comment) VALUES (?, ?, ?, ?, ?)"
                db.run(insert, [ model, user.username, score, today, comment], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve()
                })

            } catch (error) {
                reject(error);
            }
        }
      )

    }

    //restituisce tutte le recensioni di un determinato modello
    getProductReviews(model: string) : Promise<ProductReview[]> {
        return new Promise<ProductReview[]>(async (resolve, reject) => {

            try {
                await ProductDAO.prototype.getProducts("model", null, model);
                const sql = "SELECT * FROM reviews WHERE model = ?";
                db.all(sql, [ model], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                   const reviews = rows.map((row: { model: string; user: string; score: number; date: string; comment: string; }) => new ProductReview(row.model, row.user, row.score, row.date, row.comment));
                    resolve(reviews);
                })
            } catch (error) {
                reject(error);
            }
        }
      )

    }

    //l'utente cancella la propria recensione di un determinato modello
    deleteProductReview(model: string, user: User) : Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            try {
                
                // Verifico che il modello esista nel db
                let prodotto = new ProductDAO;
                if((await prodotto.getProducts("model", null, model)).length === 0){
                    reject(new ProductNotFoundError());
                        return;
                }

                
                // Prima di eliminarla, verifico che l'utente abbia già scritto una recensione sul modello
                const verify = "SELECT * FROM reviews WHERE user = ? AND model = ?";
                db.get(verify, [ user.username, model ], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    
                    if(!row){
                        reject(new NoReviewProductError());
                        return;
                    }
                })

                //elimino la recensione
                const query = "DELETE FROM reviews WHERE user = ? AND model = ?";
                db.run(query, [ user.username, model], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    
                    resolve();
                })
            } catch (error) {
                reject(error);
            }
        }
      )

    }

    //cancella tutte le recensioni di un determinato modello
    deleteReviewsOfProduct(model: string) : Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            try {
                
                // Verifico che il modello esista nel db
                let prodotto = new ProductDAO;
                if((await prodotto.getProducts("model", null, model)).length === 0){
                    reject(new ProductNotFoundError());
                        return;
                }

                // Verifico che il prodotto abbia almeno una recensione
                const verify = "SELECT * FROM reviews WHERE model = ?";
                db.get(verify, [ model ], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    
                    if(!row){
                        reject(new NoReviewProductError());
                        return;
                    }
                })

                //elimino le recensioni del modello
                const query = "DELETE FROM reviews WHERE model = ?";
                db.run(query, [ model], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve();
                })
            } catch (error) {
                reject(error);
            }
        }
      )

    }

    //elimina tutte le recensioni esistenti
    deleteAllReviews() : Promise<void> {
        return new Promise<void>(async (resolve, reject) => {

            try {
                // Verifico che esista almeno una recensione
                const verify = "SELECT * FROM reviews";
                db.get(verify, [], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    
                    if(!row && false){
                        reject(new NoReviewProductError());
                        return;
                    }
                })

                //elimino tutte le recensioni
                const sql = "DELETE FROM reviews";
                db.run(sql, [], (err: Error | null, rows: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve();
                })
            } catch (error) {
                reject(error);
            }
        }
      )

    }

    verificaVenditaProdotto(customer : string, model : string) : Promise<boolean>{
        return new Promise((resolve, reject)=>{
            const usDao = new UserDAO();
            const cartDao = new CartDAO();
            usDao.getUserByUsername(customer).then((res)=>{
                    cartDao.getPastCarts(customer).then((ress)=>{
                        if(ress){
                            const promises = ress.map((x : Cart)=>{
                                return new Promise((resolveInterno, rejectInterno)=>{
                                    cartDao.getOrdersForCart(x.id).then((products)=>{
                                        if(!products || products.length===0) resolveInterno(false);
                                        let flag = false;
                                        products.forEach((y:any)=>{
                                            if(y.model==model){
                                                flag = true;
                                            }
                                        });
                                        resolveInterno(flag);
                                    }).catch(err=>resolveInterno(false));
                                });
                            });
                            Promise.all(promises).then((results) => {
                                if(results.some(result => result === true)){
                                    return resolve(true);
                                }else{
                                    return resolve(false);
                                }
                            }).catch((err)=>reject(err));
                        }else{
                            return resolve(false);
                        }
                    }).catch((err)=>reject(err));
            }).catch((err)=>reject(err));
        })
    }


}

export default ReviewDAO;