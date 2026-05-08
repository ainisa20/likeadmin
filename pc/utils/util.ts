/**
 * @description 添加单位
 * @param {String | Number} value 值 100
 * @param {String} unit 单位 px em rem
 */
export const addUnit = (value: string | number, unit = 'px') => {
    return !Object.is(Number(value), NaN) ? `${value}${unit}` : value
}

/**
 * @description 树转数组，队列实现广度优先遍历
 * @param {Array} data  数据
 * @param {Object} props `{ children: 'children' }`
 */

export const treeToArray = (data: any[], props = { children: 'children' }) => {
    data = JSON.parse(JSON.stringify(data))
    const { children } = props
    const newData = []
    const queue: any[] = []
    data.forEach((child: any) => queue.push(child))
    while (queue.length) {
        const item: any = queue.shift()
        if (item[children]) {
            item[children].forEach((child: any) => queue.push(child))
            delete item[children]
        }
        newData.push(item)
    }
    return newData
}

/**
 * @description 获取正确的路经
 * @param {String} path  数据
 */
export function getNormalPath(path: string) {
    if (path.length === 0 || !path || path == 'undefined') {
        return path
    }
    const newPath = path.replace('//', '/')
    const length = newPath.length
    if (newPath[length - 1] === '/') {
        return newPath.slice(0, length - 1)
    }
    return newPath
}

/**
 * @description对象格式化为Query语法
 * @param { Object } params
 * @return {string} Query语法
 */
export function objectToQuery(params: Record<string, any>): string {
    let query = ''
    for (const props of Object.keys(params)) {
        const value = params[props]
        if (!isEmpty(value)) {
            query += props + '=' + value + '&'
        }
    }
    return query.slice(0, -1)
}

/**
 * 生成 UUID（兼容性降级方案）
 * 优先使用 crypto.randomUUID()，失败时降级到随机数生成
 */
export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        try {
            return crypto.randomUUID()
        } catch (e) {
            // 降级到手动生成
        }
    }
    // 降级方案：生成类似 UUID 的字符串
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
