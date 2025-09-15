import request from '@/utils/request'

/**
 * 发送聊天消息（支持流式响应）
 * @param {FormData} formData - 包含消息和文件的FormData
 * @param {AbortSignal} signal - 用于中止请求的AbortSignal
 * @returns {Promise<Response>} - 原始Response对象，用于流式读取
 */
export function sendChatMessage(formData, signal) {
    // 注意：若依的 request 可能基于axios，默认不支持流式响应。
    // 这里使用原生fetch API来实现流式响应
    return fetch('/chat', {
        method: 'POST',
        body: formData,
        signal: signal,
        // 根据后端实现，可能需要添加认证头等信息
        headers: {
            'Authorization': `Bearer ${getToken()}`, // 假设有getToken方法获取登录token
        },
    })
}

/**
 * 获取当前用户token（示例方法，需根据若依实际实现调整）
 * @returns {string} token
 */
function getToken() {
    // 若依通常将token存储在localStorage或cookie中，例如：
    return localStorage.getItem('token') || ''
}

/**
 * 传统的非流式消息发送（备用方案）
 * 如果流式实现有问题，可以回退到此方法
 */
export function sendChatMessageTraditional(messageData) {
    return request({
        url: '/chat',
        method: 'post',
        data: messageData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}