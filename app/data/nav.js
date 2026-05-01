import {
    Star,
    Dock,
    Lightbulb,
    Image,
    Wrench,
    BookOpen,
    Code,
    Server,
    Info,
    BrainCircuit, MessageSquare, Wand2,
    Layout, Database, Cloud, Terminal, GitBranch,
    FileText, Link,
    Chrome,
    Box
} from 'lucide-vue-next'

export const navConfig = [

    /* ===== 核心入口 ===== */
    {
        name: '常用推荐',
        id: 'recommend',
        icon: Star
    },
    {
        name: '社区资讯',
        id: 'news',
        icon: Dock
    },

    /* ===== AI类 ===== */
    {
        name: 'AI热门',
        icon: BrainCircuit,
        children: [
            { id: 'ai-chat', name: 'AI对话', icon: MessageSquare },
            { id: 'ai-code', name: 'AI编程', icon: Code },
            { id: 'ai-image', name: 'AI绘图', icon: Image },
            { id: 'ai-tools', name: '效率工具', icon: Wand2 }
        ]
    },

    /* ===== 内容类 ===== */
    {
        name: '灵感设计',
        icon: Lightbulb,
        children: [
            { id: 'inspiration', name: '创意灵感', icon: Lightbulb },
            { id: 'design-tools', name: '设计工具', icon: Image }
        ]
    },

    {
        name: '资源素材',
        icon: Image,
        children: [
            { id: 'icons', name: '图标素材', icon: Image },
            { id: 'images', name: '图片资源', icon: Image },
            { id: 'storage', name: '软件仓储', icon: Box },
        ]
    },

    /* ===== 技术类 ===== */
    {
        name: '开发运维',
        icon: Code,
        children: [

            { id: 'dev-tools', name: '开发工具', icon: Terminal },
            { id: 'frontend', name: '前端开发', icon: Layout },
            { id: 'backend', name: '后端开发', icon: Server },
            { id: 'database', name: '数据库', icon: Database },
            { id: 'devops', name: 'DevOps', icon: GitBranch },
            { id: 'cloud', name: '云原生', icon: Cloud },
        ]
    },

    /* ===== 工具类 ===== */
    {
        name: '效率工具',
        icon: Wrench,
        children: [
            { id: 'chrome-extensions', name: 'Chrome插件', icon: Chrome },
            { id: 'file-tools', name: '文件处理', icon: FileText },
            { id: 'image-tools', name: '图片处理', icon: Image },
            { id: 'online-tools', name: '在线工具', icon: Link },
            { id: 'tools', name: '其他工具', icon: Wrench },
        ]
    },

    /* ===== 学习类 ===== */
    {
        name: '学习成长',
        icon: BookOpen,
        children: [
            { id: 'tutorials', name: '教程文档', icon: BookOpen },
            { id: 'courses', name: '课程资源', icon: BookOpen }
        ]
    },

    /* ===== 其他 ===== */
    {
        name: '关于本站',
        id: 'about',
        icon: Info,
        url: '/about'
    }

]