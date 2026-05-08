<template>
    <div class="wizard-report-lists">
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="姓名">
                    <el-input v-model="queryParams.name" placeholder="输入姓名" clearable @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="手机号">
                    <el-input v-model="queryParams.phone" placeholder="输入手机号" clearable @keyup.enter="resetPage" />
                </el-form-item>
                <el-form-item class="w-[280px]" label="身份类型">
                    <el-select v-model="queryParams.identity_type" placeholder="全部" clearable>
                        <el-option label="应届/毕业5年内" value="graduate" />
                        <el-option label="OPC/AI创业者" value="opc" />
                        <el-option label="在校大学生" value="student" />
                        <el-option label="双重身份" value="both" />
                    </el-select>
                </el-form-item>
                <el-form-item class="w-[280px]" label="处理状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option label="未处理" :value="0" />
                        <el-option label="已处理" :value="1" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="ID" prop="id" width="70" />
                <el-table-column label="姓名" prop="name" min-width="80" />
                <el-table-column label="手机号" prop="phone" min-width="120" />
                <el-table-column label="创业方向" prop="direction" min-width="160" show-overflow-tooltip />
                <el-table-column label="身份" prop="identity_type" min-width="100">
                    <template #default="{ row }">
                        {{ identityMap[row.identity_type] || row.identity_type }}
                    </template>
                </el-table-column>
                <el-table-column label="区域" prop="region" min-width="80">
                    <template #default="{ row }">
                        {{ regionMap[row.region] || row.region }}
                    </template>
                </el-table-column>
                <el-table-column label="主题" prop="theme_name" min-width="140" show-overflow-tooltip />
                <el-table-column label="状态" min-width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'info'">
                            {{ row.status === 1 ? '已处理' : '未处理' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">查看报告</el-button>
                        <el-button type="primary" link @click="handleRemark(row)">备注</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 报告详情弹窗 -->
        <el-dialog v-model="detailVisible" title="OPC创业落地分析报告" width="800px" top="5vh">
            <el-descriptions :column="2" border size="small" class="mb-4">
                <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
                <el-descriptions-item label="联系方式">{{ detail.phone }}</el-descriptions-item>
                <el-descriptions-item label="身份">{{ identityMap[detail.identity_type] || detail.identity_type }}</el-descriptions-item>
                <el-descriptions-item label="注册区域">{{ regionMap[detail.region] || detail.region }}</el-descriptions-item>
                <el-descriptions-item label="创业方向" :span="2">{{ detail.direction }}</el-descriptions-item>
                <el-descriptions-item label="启动资金">{{ detail.budget }}</el-descriptions-item>
                <el-descriptions-item label="带动就业">{{ detail.employee_count }}</el-descriptions-item>
                <el-descriptions-item label="云服务器">{{ detail.need_server ? '需要' : '不需要' }}</el-descriptions-item>
                <el-descriptions-item label="AI日均调用">{{ detail.ai_calls }}</el-descriptions-item>
                <el-descriptions-item label="海外市场">{{ detail.overseas ? '是' : '否' }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ detail.register_time }}</el-descriptions-item>
            </el-descriptions>

            <el-divider content-position="left">报告内容</el-divider>
            <div class="report-content" v-html="renderMarkdown(detail.report_content)"></div>

            <el-divider content-position="left">备注</el-divider>
            <div style="white-space: pre-wrap; color: #666;">{{ detail.remark || '无' }}</div>
        </el-dialog>

        <!-- 备注弹窗 -->
        <el-dialog v-model="remarkVisible" title="备注" width="500px">
            <el-input v-model="remarkForm.remark" type="textarea" :rows="4" placeholder="请输入备注" />
            <template #footer>
                <el-button @click="remarkVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSaveRemark">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { wizardReportLists, wizardReportDetail, wizardReportDelete, wizardReportUpdateRemark } from '@/api/wizard_report'
import { marked } from 'marked'

const identityMap: Record<string, string> = {
    graduate: '应届/毕业5年内',
    opc: 'OPC/AI创业者',
    student: '在校大学生',
    both: '双重身份',
}

const regionMap: Record<string, string> = {
    luohu: '罗湖区',
    longgang: '龙岗区',
    guangming: '光明区',
    nanshan: '南山区',
    other: '其他区',
}

const queryParams = reactive({
    name: '',
    phone: '',
    identity_type: '',
    status: ''
})

const pager = reactive({
    loading: false,
    lists: [] as any[],
    page: 1,
    limit: 15,
    count: 0
})

const detailVisible = ref(false)
const remarkVisible = ref(false)
const detail = ref<any>({})
const remarkForm = reactive({ id: 0, remark: '' })

const renderMarkdown = (content: string) => {
    if (!content) return ''
    return marked(content)
}

const getLists = async () => {
    pager.loading = true
    try {
        const res = await wizardReportLists({
            ...queryParams,
            page: pager.page,
            limit: pager.limit
        })
        pager.lists = res.lists
        pager.count = res.count
    } finally {
        pager.loading = false
    }
}

const resetPage = () => {
    pager.page = 1
    getLists()
}

const resetParams = () => {
    Object.assign(queryParams, { name: '', phone: '', identity_type: '', status: '' })
    resetPage()
}

const handleDetail = async (row: any) => {
    const res = await wizardReportDetail({ id: row.id })
    detail.value = res
    detailVisible.value = true
}

const handleDelete = (row: any) => {
    ElMessageBox.confirm('确认删除该报告记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await wizardReportDelete({ id: row.id })
        ElMessage.success('删除成功')
        getLists()
    })
}

const handleRemark = (row: any) => {
    remarkForm.id = row.id
    remarkForm.remark = row.remark || ''
    remarkVisible.value = true
}

const handleSaveRemark = async () => {
    await wizardReportUpdateRemark(remarkForm)
    ElMessage.success('备注保存成功')
    remarkVisible.value = false
    getLists()
}

onMounted(() => {
    getLists()
})
</script>

<style scoped>
.report-content {
    max-height: 500px;
    overflow-y: auto;
    padding: 12px;
    background: #fafafa;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.8;
}
.report-content :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 8px 0;
}
.report-content :deep(th),
.report-content :deep(td) {
    border: 1px solid #ddd;
    padding: 6px 10px;
    font-size: 13px;
}
.report-content :deep(th) {
    background: #f0f0f0;
}
.report-content :deep(h2) {
    margin: 16px 0 8px;
    font-size: 16px;
}
.report-content :deep(h3) {
    margin: 12px 0 6px;
    font-size: 14px;
}
</style>
