"use strict"

import db from "../db/db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export const cleanup = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        db.run("DELETE FROM reviews", (err: any, _: any) => {
            if (err) return reject();
            db.run("DELETE FROM orders", (err: any, _: any) => {
                if (err) return reject();
                db.run("DELETE FROM carts", (err: any, _: any) => {
                    if (err) return reject();
                    db.run("DELETE FROM products", (err: any, _: any) => {
                        if (err) return reject();
                        db.run("DELETE FROM users", (err: any, _: any) => {
                            if (err) return reject();
                            resolve();
                        });
                    });
                });
            });
        });
    });
};

