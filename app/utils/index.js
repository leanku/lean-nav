import siteDataRaw from '@/data/sites.json'

// 缓存处理好的数据，避免每次调用重新计算
let processedData = null

export const useSiteData = () => {
    if (processedData) {
        return processedData
    }

    processedData = {}

    if (!siteDataRaw || typeof siteDataRaw !== 'object') {
        console.warn('Failed to load siteDataRaw from sites.json')
        return processedData
    }

    for (const [category, sites] of Object.entries(siteDataRaw)) {
        processedData[category] = (sites || []).map(site => {
            let domain = ''
            try {
                if (site && site.url) {
                    // 过滤掉相对路径或非 HTTP/HTTPS 协议的 url
                    if (site.url.startsWith('http')) {
                        domain = new URL(site.url).hostname
                    }
                }
            } catch (e) {
                // 忽略无效的 URL 错误
            }
            return {
                ...site,
                domain
            }
        })
    }

    return processedData
}