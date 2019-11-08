import * as Line from '@line/bot-sdk';
import * as Aws from 'aws-sdk';
import * as Rp from 'request-promise';
const crypto = require('crypto');
const dynamo = new Aws.DynamoDB.DocumentClient();
const client = new Line.Client({
    channelAccessToken: ''
})
const payChannelSecret: string = '';

exports.handler = async (event: any) => {
    console.log(JSON.stringify(event));
    const orderId: string = event.queryStringParameters.orderId;
    const transactionId: string = event.queryStringParameters.transactionId;
    
    const userId: string = orderId.substring(0, orderId.indexOf('_'));
    
    console.log('orderId: ' + orderId);
    console.log('transactionId: ' + transactionId);
    console.log('userId: ' + userId);

    const result = await confirmPaymentRequest(transactionId);
    console.log(JSON.stringify(result));

    if (result.returnCode == '0000') {
        const param: Aws.DynamoDB.DocumentClient.PutItemInput = {
            TableName: '',
            Item: {
                userId: userId,
                regKey: result.info.regKey
            }
        }
        await dynamo.put(param).promise();
        const message: Line.Message[] = [
            {
                type: 'text',
                text: '登録が完了しました。毎月1日に引き落とされます。'
            }
        ];
        await client.pushMessage(userId, message);
    } else {
        const message: Line.Message[] = [
            {
                type: 'text',
                text: '登録に失敗しました。後ほどやり直してください。'
            }
        ];
        await client.pushMessage(userId, message);
    }

    return {
        statusCode: 200
    };
}

const confirmPaymentRequest = async (transactionId: string) => {
    const body = {
        amount: 330,
        currency: 'JPY'
    };
    const nonce = String(Date.now());
    const path = String('/v3/payments/' + transactionId + '/confirm');
    console.log(path);
    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': '1569809502',
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': crypto.createHmac('sha256', payChannelSecret).update(payChannelSecret + path + JSON.stringify(body) + nonce).digest('base64')
    }

    const options = {
        method: 'POST',
        uri: 'https://api-pay.line.me' + path,
        json: body,
        headers: headers
    }

    console.log(body);

    const result: any = await Rp(options).promise();
    console.log('LINE Pay Result: ' + JSON.stringify(result));
    return result;
}