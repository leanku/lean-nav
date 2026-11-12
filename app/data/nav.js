// 分类结构：图标使用字符串名称，由 app/utils/icons.js 统一解析。
// 这样整份导航配置可以被序列化、编辑、导入导出，无需修改代码。
// 每个 id 对应 app/data/sites.json 中的同名分类。
// DESIGN.md 第 6 节：每个分组与栏目使用唯一语义图标，不复用。

export const navConfig = [

    /* ===== 核心入口 ===== */
    {
        name: '常用推荐',
        id: 'recommend',
        icon: 'Star'
    },
    {
        name: '社区资讯',
        id: 'news',
        icon: 'Newspaper'
    },

    /* ===== AI类 ===== */
    {
        name: 'AI热门',
        id: 'ai',
        icon: 'BrainCircuit',
        children: [
            { id: 'ai-chat', name: 'AI对话', icon: 'MessagesSquare' },
            { id: 'ai-code', name: 'AI编程', icon: 'Bot' },
            { id: 'ai-image', name: 'AI绘图', icon: 'Palette' },
            { id: 'ai-tools', name: 'AI效率工具', icon: 'WandSparkles' }
        ]
    },

    /* ===== 内容类 ===== */
    {
        name: '灵感设计',
        id: 'design',
        icon: 'Lightbulb',
        children: [
            { id: 'inspiration', name: '创意灵感', icon: 'Sparkles' },
            { id: 'design-tools', name: '设计工具', icon: 'PenTool' }
        ]
    },

    {
        name: '资源素材',
        id: 'resources',
        icon: 'Boxes',
        children: [
            { id: 'icons', name: '图标素材', icon: 'Shapes' },
            { id: 'images', name: '图片资源', icon: 'Images' },
            { id: 'storage', name: '软件仓储', icon: 'Package' },
        ]
    },

    /* ===== 技术类 ===== */
    {
        name: '开发运维',
        id: 'development',
        icon: 'Code2',
        children: [

            { id: 'dev-tools', name: '开发工具', icon: 'Terminal' },
            { id: 'frontend', name: '前端开发', icon: 'AppWindow' },
            { id: 'backend', name: '后端开发', icon: 'Server' },
            { id: 'database', name: '数据库', icon: 'Database' },
            { id: 'devops', name: 'DevOps', icon: 'GitBranch' },
            { id: 'cloud', name: '云原生', icon: 'Cloud' },
        ]
    },

    /* ===== 工具类 ===== */
    {
        name: '效率工具',
        id: 'toolbox',
        icon: 'Wrench',
        children: [
            { id: 'chrome-extensions', name: 'Chrome插件', icon: 'Puzzle' },
            { id: 'file-tools', name: '文件处理', icon: 'FileText' },
            { id: 'image-tools', name: '图片处理', icon: 'Image' },
            { id: 'online-tools', name: '在线工具', icon: 'Link2' },
            { id: 'productivity', name: '效率应用', icon: 'Zap' },
            { id: 'tools', name: '其他工具', icon: 'Blocks' },
        ]
    },

    /* ===== 学习类 ===== */
    {
        name: '学习成长',
        id: 'learning',
        icon: 'Library',
        children: [
            { id: 'tutorials', name: '教程文档', icon: 'BookOpen' },
            { id: 'courses', name: '课程资源', icon: 'GraduationCap' }
        ]
    },

    /* ===== 其他 ===== */
    {
        name: '关于本站',
        id: 'about',
        icon: 'Info',
        url: '/about'
    }

]
