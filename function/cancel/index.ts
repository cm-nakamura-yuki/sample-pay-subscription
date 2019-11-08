import * as Line from '@line/bot-sdk';
const client = new Line.Client({
    channelAccessToken: ''
})

exports.handler = async (event: any) => {
    console.log(JSON.stringify(event));

    const orderId: string = event.queryStringParameters.orderId;
    const userId: string = orderId.substring(0, orderId.indexOf('_'));

    const message: Line.Message[] = [
        {
            type: 'text',
            text: 'キャンセルしました。'
        }
    ];

    await client.pushMessage(userId, message);
    return {
        statusCode: 200
    };
}