const crypto = require('crypto');
const {
    TransactionHandler
} = require('sawtooth-sdk/processor/handler')
const {
    InvalidTransaction
} = require('sawtooth-sdk/processor/exceptions')

const _decodePayload = (payload) => new Promise((resolve, reject) => {
    try {
        return JSON.parse(payload);
    } catch (error) {
        return reject(`Error while parsing the input`);
    }
});

const _encodePayload = (payload) => new Promise((resolve, reject) => {
    resolve(Buffer.from(JSON.stringify(payload)))
})

const _hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()


const _toInvalidTransaction = (err) => {
    let message = (err.message) ? err.message : err
    throw new InvalidTransaction(message)
}

const _toInvalidAction = (action) => {
    throw new InvalidTransaction(`${action} Action Field contains invalid Action type`)
}

const _toInvalidPayload = (field) => {
    throw new InvalidTransaction(`${field} Data Field contains invalid value/ doesn't contain value`)
}

const FAMILY_NAME = process.env.FAMILY_NAME || 'marble';
const FAMILY_VERSION = process.env.FAMILY_VERSION || '1.0';
const FAMILY_NAMESPACE = _hash(FAMILY_NAME).substring(0, 6);

class MarbleHandler extends TransactionHandler {

    constructor() {
        super(FAMILY_NAME, [FAMILY_VERSION], [FAMILY_NAMESPACE])
    }

    apply(transactionProcessRequest, context) {
        return _decodePayload(transactionProcessRequest.payload).then(async (payload) => {
            // Action [Set, Delete] 
            // Data  Weight: 1-10 Creator: John Doe Id: 1
            const {
                Action,
                Value
            } = payload;
            const {
                Weight,
                Creator,
                Id
            } = Value;
            if (Action) {
                if (Id) {
                    const address = `${FAMILY_NAMESPACE}${_hash(name).slice(-64)}`;
                    const possibleAddressStateValues = await context.getState([address]).catch(_toInvalidTransaction);
                    const stateRep = possibleAddressStateValues[address];
                    let createdAlready = stateRep && stateRep.length;
                    const stateVal = _decodePayload(stateRep);
                    if (Action === 'SET') {
                        if (createdAlready) {
                            stateVal.TransferedTo = Creator;
                        }
                        stateVal.Weight = Weight;
                        return context.setState({
                            [address]: _encodePayload(stateVal)
                        }).catch(_toInvalidTransaction);

                    } else if (Action === 'DELETE') {
                        return context.deleteState([address]).catch(_toInvalidTransaction);
                    }
                }
                return _toInvalidPayload(Id);
            } else {
                return _toInvalidAction(Action);
            }
        }).catch(_toInvalidTransaction);
    }
}

module.exports = MarbleHandler