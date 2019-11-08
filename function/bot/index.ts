import * as Line from '@line/bot-sdk';
import * as Aws from 'aws-sdk';
import * as Rp from 'request-promise';
const crypto = require('crypto');
const dynamo = new Aws.DynamoDB.DocumentClient();
const client = new Line.Client({
    channelAccessToken: ''
});
const payChannelSecret: string = '';

exports.handler = async (event: any) => {
    console.log('Event: ' + JSON.stringify(event));

    if (!Line.validateSignature(event.body, '', event['headers']['X-Line-Signature'])) {
        console.log('Validate signature failed.');
        return {
            statusCode: 200
        };
    }

    const body = JSON.parse(event.body);
    const input = body.events[0]; //TODO: 1リクエストで複数イベントが発生した時の処理

    if (input.type != 'message') {
        console.log('Detect ' + input.type  + ' event. We can send message when you send text.');
        return {
            statusCode: 200
        }
    }

    const userId: string = input.source.userId;
    const replyToken: string = input.replyToken;

    const userInfo: Aws.DynamoDB.DocumentClient.AttributeMap | undefined = await getUserInfo(userId);
    console.log('UserInfo: ' + JSON.stringify(userInfo));

    if (userInfo === undefined){
        //LINE Payでユーザー決済承認URLを生成
        const url = await getRequestUrl(userId);
        const messages: Line.Message[] = [
            {
                type: 'text',
                text: 'お客様はまだサブスクリプションの登録がされておりません。'
            },
            {
                type: 'template',
                altText: 'サブスクリプション登録する',
                template: {
                    type: 'buttons',
                    text: 'サブスクリプション登録をお願いします。',
                    actions: [
                        {
                            type: 'uri',
                            label: '登録する',
                            uri: url.info.paymentUrl.app
                        }
                    ]
                }
            }
        ];
        await client.replyMessage(replyToken, messages); 
    } else {
        const messages: Line.Message[] = [
            {
                type: 'text',
                text: 'お客様はご契約いただいております。'
            }
        ];
        await client.replyMessage(replyToken, messages);
    }
    return {
        statusCode: 200
    }
}

const getUserInfo = async (userId: string): Promise<Aws.DynamoDB.DocumentClient.AttributeMap|undefined> => {
    console.log('Get user\'s info: ' + userId);
    const param: Aws.DynamoDB.DocumentClient.GetItemInput = {
        TableName: '',
        Key: {
            userId: userId
        }
    };

    const result: Aws.DynamoDB.DocumentClient.GetItemOutput = await dynamo.get(param).promise();
    if (result && result.Item) {
        return result.Item;
    } else {
        return undefined;
    }
}

const getRequestUrl = async (userId: string) => {
    const orderId = String(userId + '_' + Date.now());
    const body = {
        amount: 330,
        currency: 'JPY',
        orderId:  orderId,
        packages: [
            {
                id: 0,
                amount: 330,
                name: 'Pay de Subscription',
                products: [
                    {
                        name: 'Pay de Subscription',
                        quantity: 1,
                        price: 330
                    }
                ]
            }
        ],
        redirectUrls: {
            confirmUrl: '',
            confirmUrlType: 'SERVER',
            cancelUrl: '?orderId='  + orderId
        },
        options: {
            payment: {
                payType: 'PREAPPROVED'
            },
            display: {
                flowType: 'HIDE_PAY_SCREEN'
            }
        }
    };
    const nonce = String(Date.now());
    const headers = {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': '',
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': crypto.createHmac('sha256', payChannelSecret).update(payChannelSecret + '/v3/payments/request' + JSON.stringify(body) + nonce).digest('base64')
    }

    const options = {
        method: 'POST',
        uri: 'https://api-pay.line.me/v3/payments/request',
        json: body,
        headers: headers
    }

    console.log(body);

    const result: any = await Rp(options).promise();
    console.log('LINE Pay Result: ' + JSON.stringify(result));
    return result;
}