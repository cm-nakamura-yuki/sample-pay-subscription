import * as Rp from 'request-promise';
const crypto = require('crypto');

const regkey: string = '';
const userId: string = '';
const channelId: string = '';
const channelSecret: string = '';

const load = async(regkey: string) => {
    let check = await checkRegkey(regkey);
    console.log('checkRegkey: ' + JSON.stringify(check));
    if (check.returnCode == '0000') {
        let pay = await confirmRegkey(regkey, userId);
        console.log('confirmRegkey: ' + JSON.stringify(pay));

        //let expire = await expireRegkey(regkey);
        //console.log('expireRegkey: ' + JSON.stringify(expire));
    }
};


const checkRegkey = async (regkey: string) => {
    const nonce = String(Date.now());
    const path = '/v3/payments/preapprovedPay/' + regkey + '/check';
    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': crypto.createHmac('sha256', channelSecret).update(channelSecret + path + nonce).digest('base64')
    };
    const options = {
        method: 'GET',
        uri: 'https://api-pay.line.me' + path,
        headers: headers
    }

    const result: any = await Rp(options).promise();
    return JSON.parse(result);
}

const expireRegkey = async (regkey: string) => {
    const nonce = String(Date.now());
    const path = '/v3/payments/preapprovedPay/' + regkey + '/expire';
    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': crypto.createHmac('sha256', channelSecret).update(channelSecret + path + JSON.stringify({}) + nonce).digest('base64')
    };
    const options = {
        method: 'POST',
        uri: 'https://api-pay.line.me' + path,
        body: JSON.stringify({}),
        headers: headers
    }

    const result: any = await Rp(options).promise();
    return JSON.parse(result);
}

const confirmRegkey = async (regkey: string, userId: string) => {
    const body = {
        productName: 'Pay de Subscription from regkey',
        amount: 330,
        currency: 'JPY',
        orderId: userId + '_' + Date.now(),
        capture: true
    };
    const path = '/v3/payments/preapprovedPay/' + regkey + '/payment';
    const nonce = String(Date.now());
    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': crypto.createHmac('sha256', channelSecret).update(channelSecret + path + JSON.stringify(body) + nonce).digest('base64')
    }

    const options = {
        method: 'POST',
        uri: 'https://api-pay.line.me' + path,
        json: body,
        headers: headers
    }

    console.log(body);

    const result: any = await Rp(options).promise();
    return result;
}

load(regkey);
