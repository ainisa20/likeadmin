// 提交评估申请表单
export function submitAssessment(data: {
    name: string
    phone: string
    content?: string
}) {
    return $request.post({
        url: '/assessment/submit',
        params: data
    })
}
