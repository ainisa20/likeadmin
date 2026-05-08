import request from '@/utils/request'

export function wizardReportLists(params?: any) {
    return request.get({ url: '/wizard.wizard_report/lists', params })
}

export function wizardReportDetail(params: any) {
    return request.get({ url: '/wizard.wizard_report/detail', params })
}

export function wizardReportDelete(params: any) {
    return request.post({ url: '/wizard.wizard_report/delete', params })
}

export function wizardReportUpdateStatus(params: any) {
    return request.post({ url: '/wizard.wizard_report/updateStatus', params })
}

export function wizardReportUpdateRemark(params: any) {
    return request.post({ url: '/wizard.wizard_report/updateRemark', params })
}
