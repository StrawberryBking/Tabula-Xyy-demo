import { messageHandlers } from "./msgHandler.mjs";
import { sendMsgWithRes } from "./sender.mjs";
class MySocket {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.init();
    }

    init() {
        this.ws.onopen = function (event) {
            console.log('websocket已连接', this.ws);
            window.parent.DRAPI.emit("socket-open", {});
        };
        this.ws.onmessage = function (event) {
            try {
                const data = JSON.parse(event.data);
                messageHandlers[data.type](data, this.ws, editor);
            } catch (e) { console.log("parse-serverinfo-err", e) }
        };
        this.ws.onclose = function (event) {
            alert("连接已关闭...");
        };
    }

    sendMsg(msg) {
        //检查ws的状态
        if (this.ws.readyState !== 1) {
            return new Promise((resolve, reject) => {
                window.parent.DRAPI.addEventListener("socket-open", () => {
                    sendMsgWithRes(this.ws, msg).then((res) => {
                        resolve(res);
                    })
                });
            });

        } else {
            return sendMsgWithRes(this.ws, msg);
        }
    }


}

export {
    MySocket as default
}