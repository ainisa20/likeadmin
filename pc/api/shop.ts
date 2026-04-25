//首页数据
export function getIndex() {
    return $request.get({ url: '/pc/index' })
}

export function getPageData(pageId: number) {
    return $request.get({ url: '/pc/page', params: { id: pageId } })
}
