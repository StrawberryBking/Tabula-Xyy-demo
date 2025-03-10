

// 发送消息, 并在超时后重试, 直到重试次数用尽
export function sendMessageWithRetry(ws, message, retries = 3, delay = 500) {
    const pendingMessages = new Map();// 存储待发送的消息
    console.log('test-ws', ws);//ws是一个WebSocket对象,webSocke对象是一个全双工的通信通道，可以实现客户端和服务器端的双向通信

    const requestId = Date.now() + Math.random().toString(36).substr(2, 9);//生成一个唯一的请求ID
    const messageWithId = { ...message, requestId };//将请求ID添加到消息中

    ws.send(JSON.stringify(messageWithId));//发送消息，将消息转换为字符串，发送给服务器

    console.log(window.emitter);

    window.parent.DRAPI.addEventListener('confirm', (data) => {
        if (pendingMessages.has(requestId)) {//如果消息存在,则清除消息
            clearTimeout(pendingMessages.get(requestId).timeout);//清除定时器
            pendingMessages.delete(requestId);//删除消息
        }
        console.log('confirm', data);
    });

    // 设置超时重试
    const timeout = setTimeout(() => {
        if (retries > 0) {
            console.log(`重试发送消息: ${requestId}, 剩余重试次数: ${retries}`);//如果重试次数大于0，则重试发送消息
            sendMessageWithRetry(ws, message, retries - 1, delay);//重试发送消息
        } else {//如果重试次数小于等于0，则打印消息发送失败
            console.log(`消息发送失败: ${requestId}`);//打印消息发送失败
        }
    }, delay);//设置延迟时间

    // 存储待响应的消息
    pendingMessages.set(requestId, { timeout });
}




export function sendMsgWithRes(ws, message, retries = 3, delay = 500) {
    return new Promise((resolve, reject) => {
        const requestId = Date.now() + Math.random().toString(36).substr(2, 9);//生成一个唯一的请求ID
        const messageWithId = { ...message, requestId };//将请求ID添加到消息中

        ws.send(JSON.stringify(messageWithId));//发送消息，将消息转换为字符串，发送给服务器

        window.parent.DRAPI.addEventListener('confirm' + requestId, (data) => {

            console.log('confirm', data);
            clearTimeout(timeout);//清除定时器
            resolve(data);
        });

        // 设置超时重试
        const timeout = setTimeout(() => {
            if (retries > 0) {
                console.log(`重试发送消息: ${requestId}, 剩余重试次数: ${retries}`);//如果重试次数大于0，则重试发送消息
                sendMsgWithRes(ws, message, retries - 1, delay);//重试发送消息
            } else {//如果重试次数小于等于0，则打印消息发送失败
                console.log(`消息发送失败: ${requestId}`);//打印消息发送失败
                reject(new Error(`消息发送失败: ${requestId}`));
            }
        }, delay);//设置延迟时间


    });
}