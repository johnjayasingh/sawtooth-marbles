'use strict'

const {
    TransactionProcessor
} = require('sawtooth-sdk/processor')
const MarbleHandler = require('./handler')

if (process.env.VALIDATOR_URL) {
    console.error('missing a validator address')
}

const address = process.env.VALIDATOR_URL || 'tcp://validator:4004'

const transactionProcessor = new TransactionProcessor(address)

transactionProcessor.addHandler(new MarbleHandler())

transactionProcessor.start()