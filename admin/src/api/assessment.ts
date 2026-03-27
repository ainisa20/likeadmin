import request from '@/utils/request'

// 列表
export function assessmentLists(params?: any) {
    return request.get({ url: '/assessment.assessment/lists', params })
}

// 详情
export function assessmentDetail(params: any) {
    return request.get({ url: '/assessment.assessment/detail', params })
}

// 删除
export function assessmentDelete(params: any) {
    return request.post({ url: '/assessment.assessment/delete', params })
}

// 更新状态
export function assessmentUpdateStatus(params: any) {
    return request.post({ url: '/assessment.assessment/updateStatus', params })
}

// 更新备注
export function assessmentUpdateRemark(params: any) {
    return request.post({ url: '/assessment.assessment/updateRemark', params })
}
