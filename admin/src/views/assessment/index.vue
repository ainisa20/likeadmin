<template>
    <div class="assessment-lists">
        <el-card class="!border-none" shadow="never">
            <el-form ref="formRef" class="mb-[-16px]" :model="queryParams" :inline="true">
                <el-form-item class="w-[280px]" label="姓名">
                    <el-input
                        v-model="queryParams.name"
                        placeholder="输入姓名"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="手机号">
                    <el-input
                        v-model="queryParams.phone"
                        placeholder="输入手机号"
                        clearable
                        @keyup.enter="resetPage"
                    />
                </el-form-item>
                <el-form-item class="w-[280px]" label="处理状态">
                    <el-select v-model="queryParams.status" placeholder="全部" clearable>
                        <el-option label="待处理" :value="0" />
                        <el-option label="已联系" :value="1" />
                        <el-option label="已成交" :value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="resetPage">查询</el-button>
                    <el-button @click="resetParams">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="!border-none mt-4" shadow="never">
            <div>
                <el-button 
                    type="primary" 
                    class="mb-4"
                    @click="handleExport"
                >
                    <template #icon>
                        <icon name="el-icon-Download" />
                    </template>
                    导出数据
                </el-button>
            </div>
            
            <el-table size="large" v-loading="pager.loading" :data="pager.lists">
                <el-table-column label="ID" prop="id" min-width="80" />
                <el-table-column label="姓名" prop="name" min-width="100" />
                <el-table-column label="手机号" prop="phone" min-width="130" />
                <el-table-column label="留言内容" prop="content" min-width="200" show-overflow-tooltip />
                <el-table-column label="提交IP" prop="ip" min-width="130" show-overflow-tooltip />
                <el-table-column label="处理状态" min-width="100">
                    <template #default="{ row }">
                        <el-switch
                            v-model="row.status"
                            :active-value="2"
                            :inactive-value="0"
                            active-text="已成交"
                            inactive-text="待处理"
                            @change="handleStatusChange(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="提交时间" prop="create_time" min-width="170" />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="handleDetail(row)">查看</el-button>
                        <el-button type="primary" link @click="handleRemark(row)">备注</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </el-card>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailVisible" title="详情" width="600px">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ detail.id }}</el-descriptions-item>
                <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
                <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
                <el-descriptions-item label="提交IP">{{ detail.ip }}</el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ detail.create_time }}</el-descriptions-item>
                <el-descriptions-item label="留言内容" :span="2">
                    <div style="white-space: pre-wrap; max-height: 200px; overflow-y: auto;">{{ detail.content || '无' }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="User Agent" :span="2">
                    <div style="max-height: 100px; overflow: auto; font-size: 12px;">
                        {{ detail.user_agent }}
                    </div>
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                    <div style="white-space: pre-wrap;">{{ detail.remark || '无' }}</div>
                </el-descriptions-item>
            </el-descriptions>
        </el-dialog>

        <!-- 备注弹窗 -->
        <el-dialog v-model="remarkVisible" title="备注" width="500px">
            <el-input
                v-model="remarkForm.remark"
                type="textarea"
                :rows="4"
                placeholder="请输入备注"
            />
            <template #footer>
                <el-button @click="remarkVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSaveRemark">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { assessmentLists, assessmentDelete, assessmentUpdateStatus, assessmentUpdateRemark } from '@/api/assessment'

const queryParams = reactive({
    name: '',
    phone: '',
    status: ''
})

const pager = reactive({
    loading: false,
    lists: [],
    page: 1,
    limit: 15,
    count: 0
})

const detailVisible = ref(false)
const remarkVisible = ref(false)
const detail = ref<any>({})
const remarkForm = reactive({
    id: 0,
    remark: ''
})

const getLists = async () => {
    pager.loading = true
    try {
        const params = {
            ...queryParams,
            page: pager.page,
            limit: pager.limit
        }
        const res = await assessmentLists(params)
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
    Object.assign(queryParams, {
        name: '',
        phone: '',
        status: ''
    })
    resetPage()
}

const handleDetail = (row: any) => {
    detail.value = row
    detailVisible.value = true
}

const handleDelete = (row: any) => {
    ElMessageBox.confirm('确认删除该记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        await assessmentDelete({ id: row.id })
        ElMessage.success('删除成功')
        getLists()
    })
}

const handleStatusChange = async (row: any) => {
    try {
        await assessmentUpdateStatus({
            id: row.id,
            status: row.status
        })
        ElMessage.success('状态更新成功')
    } catch {
        row.status = row.status === 2 ? 0 : 2
    }
}

const handleRemark = (row: any) => {
    remarkForm.id = row.id
    remarkForm.remark = row.remark || ''
    remarkVisible.value = true
}

const handleSaveRemark = async () => {
    await assessmentUpdateRemark(remarkForm)
    ElMessage.success('备注保存成功')
    remarkVisible.value = false
    getLists()
}

const handleExport = () => {
    ElMessage.info('导出功能开发中...')
}

onMounted(() => {
    getLists()
})
</script>
