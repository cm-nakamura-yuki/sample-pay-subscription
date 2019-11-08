"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Line = require("@line/bot-sdk");
const client = new Line.Client({
    channelAccessToken: 'w8L7TKPHybGE+GKKcrIcSu7qMkcWLyDUNnF8O0SG8iJDhei+P2ivmGoog15+RRSh4GKXegoO7T/1hlOkD4Min/VfOsbBBYKVJ+b1pT7ye9FiaPUFhszN+zwP36R9aYqNTSRKV7S+SR0mU3sttoZtDQdB04t89/1O/w1cDnyilFU='
});
exports.handler = (event) => __awaiter(this, void 0, void 0, function* () {
    console.log(JSON.stringify(event));
    const userId = 'U9617122aaeebd5f1c243978c0855c86a';
    const message = [
        {
            type: 'text',
            text: 'キャンセルしました。'
        }
    ];
    yield client.pushMessage(userId, message);
    return {
        statusCode: 200
    };
});
//# sourceMappingURL=index.js.map