// 提交评估申请表单
export function submitAssessment(data: {
    name: string
    phone: string
    stage: string
    content?: string
}) {
    console.log('发送请求前 data:', data)
    return $request.post({
        url: '/assessment/submit',
        params: data
    })
}
