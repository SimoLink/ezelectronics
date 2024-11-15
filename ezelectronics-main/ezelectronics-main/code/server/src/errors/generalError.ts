/**
 * Represents an error that occurs when a user is not found.
 */
class ConstraintError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = "Error in the constrain"
        this.customCode = 422
    }
}



class GeneralServerError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = "Internal server error"
        this.customCode = 500
    }
}


export { ConstraintError, GeneralServerError }