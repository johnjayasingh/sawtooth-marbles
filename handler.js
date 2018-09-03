class IntegerKeyHandler extends TransactionHandler {
    constructor() {
        super(INT_KEY_FAMILY, ['1.0'], [INT_KEY_NAMESPACE])
    }

    apply(transactionProcessRequest, context) {}
}