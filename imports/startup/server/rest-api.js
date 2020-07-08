import { WebApp } from 'meteor/webapp'
import { Transactions } from '../../api/transactions/transactions'

/**
 * We are exposing an api for third party users to query transactions of a user
 *
 * Initially this is developed  for the our chrome extension wallet but can be extended for other uses.
 *
 */

WebApp.connectHandlers.use('/api/transactions', (req, res) => {
    if (typeof req.query.offset === 'undefined' || typeof req.query.limit === 'undefined' || typeof req.query.address === 'undefined') {
        res.writeHead(400)
        const result = {
            'message': 'Requires the following GET paramaters: offset, address and limit'
        }
        res.end(JSON.stringify(result))
        return
    }

    let {
        limit,
        offset,
        address
    } = req.query;

    limit = parseInt(limit)
    offset = parseInt(offset)

    const query = {
        $and: [{
                $or: [{
                        'tx.value.msg.type': 'cosmos-sdk/MsgSend'
                    },
                    {
                        'tx.value.msg.type': 'cosmos-sdk/MsgMultiSend'
                    },
                ],
            },
            {
                'logs.events.attributes.value': address,
            },
        ]
    }

    let result;

    try {
        result = Transactions.find(query, {
            sort: {
                height: -1
            },
            limit: limit,
            skip: offset
        }).fetch()
    } catch (err) {
        res.writeHead(400);
        const result = {
            'message': 'query gave following database error: error: ' + err.toString()
        }
        res.end(JSON.stringify(result));
        return;
    }

    res.writeHead(200);
    res.end(JSON.stringify(result));
})