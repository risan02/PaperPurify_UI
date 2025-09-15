import type { RouteRecordRaw } from 'vue-router'

const ChatRoute: RouteRecordRaw = {
    path: '/chat-analysis',
    name: 'ChatAnalysis',
    component: () => import('@/views/chat-analysis/index.vue'),
    meta: {
        title: '志望理由分析顾问',
        // 关键：隐藏布局组件，全屏显示您的聊天界面
        hideHeader: true,
        hideSidebar: true,
        hideLayout: true, // 尽可能隐藏所有若依默认布局
        // 如果需要权限控制，可以添加：
        // roles: ['admin', 'user'],
        // permissions: ['chat:access']
    }
}

export default ChatRoute