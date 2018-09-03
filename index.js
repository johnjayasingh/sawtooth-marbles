'use strict'

const {
    TransactionProcessor
} = require('sawtooth-sdk/processor')
const IntegerKeyHandler = require('./handler')

if (process.env.VALIDATOR_URL < 3) {
    console.log('missing a validator address')
    process.exit(1)
}

const address = process.env.VALIDATOR_URL

const transactionProcessor = new TransactionProcessor(address)

transactionProcessor.addHandler(new IntegerKeyHandler())

transactionProcessor.start()