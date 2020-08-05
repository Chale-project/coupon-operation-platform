<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="流水号">
              <a-input v-model="queryParam.serialNumber" placeholder="请输入流水号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="用户手机号">
              <a-input v-model="queryParam.customerPhoneNumber" placeholder="请输入用户手机号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="所属机构">
                <a-select placeholder="请选择" v-model="queryParam.organizationId">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="所属代理商">
                <a-select placeholder="请选择" v-model="queryParam.agentId">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.agentId" v-for="(v,i) in agentList" :key="i">{{v.agentName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="waiting">待审核</a-select-option>
                  <a-select-option value="success">兑换成功</a-select-option>
                  <a-select-option value="failed">兑换失败</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="审核时间">
                <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryIntegralRecord">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="check-circle" @click="modifyIntegralRecord('success')">兑换成功</a-button>
      <a-button type="primary" icon="minus-circle" @click="modifyIntegralRecord('fail')">兑换失败</a-button>
      <a-button icon="export" @click="modifyIntegralRecord('export')">导出EXCEL</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="organizationId" slot-scope="record">
        <span v-if="v.organizationNumber==record" v-for="(v,i) of institutionList" :key="i">{{v.organizationName}}</span>
      </template>

      <template slot="failedReason" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            <span>{{record}}</span>
          </template>
          <span>{{record}}</span>
        </a-tooltip>
      </template>

      <template slot="exchangePrice" slot-scope="record">
        {{record/100}}元
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='waiting'">待审核</a-tag>
        <a-tag v-else-if="record=='success'" color="#87d068">兑换成功</a-tag>
        <a-tag v-else-if="record=='failed'" color="#ff0000">兑换失败</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="modifyIntegralRecord('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='success'">确认所选项设为兑换成功？</p>
      <p v-else-if="editType=='export'">确认导出积分记录？</p>
      <div class="modal-container" v-else-if="editType=='fail'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="失败原因">
                <a-textarea v-model="failedReason" placeholder="请输入失败原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="积分记录流水号">
                <a-input v-model="forms.serialNumber" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="用户手机号">
                <a-input v-model="forms.customerPhoneNumber" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="产品名称">
                <a-input v-model="forms.productName" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="所属机构">
                <a-select v-model="forms.organizationId" :disabled="editType=='detail'" placeholder="">
                  <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="代理商">
                <a-select v-model="forms.agentId" :disabled="editType=='detail'" placeholder="">
                  <a-select-option :value="v.agentId" v-for="(v,i) in agentList" :key="i">{{v.agentName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="兑换金额">
                <a-input type="number" v-model="forms.exchangePrice" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="兑换码">
                <a-input v-model="forms.redeemCode" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="提交时间">
                <a-input v-model="forms.addDataTime" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="审核时间">
                <a-input v-model="forms.passTime" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'||editType=='detail'">
              <a-form-item label="状态">
                <a-select v-model="forms.state" :disabled="editType=='detail'" placeholder="">
                  <a-select-option value="waiting">待审核</a-select-option>
                  <a-select-option value="success">兑换成功</a-select-option>
                  <a-select-option value="failed">兑换失败</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-if="forms.state==='failed'">
              <a-form-item label="失败原因">
                <a-textarea v-model="forms.failedReason" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-textarea v-model="forms.remark" :disabled="editType=='detail'" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="兑换订单图">
                <div class="exchange-image">
                  <img :src="forms.picPath">
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import {
  getIntegralRecordInfo,
  successIntegralRecord,
  failIntegralRecord,
  exportIntegralRecord,
  getIntegralRecordList,
  getOrganizationListAll,
  getAgentListAll
} from '@/api/common'

const columns = [
  { title: '流水号', width: '12%', dataIndex: 'serialNumber' },
  {
    title: '用户手机',
    width: '10%',
    dataIndex: 'customerPhoneNumber'
  },
  {
    title: '产品名称',
    width: '10%',
    dataIndex: 'productName'
  },
  {
    title: '所属机构',
    width: '10%',
    dataIndex: 'organizationId',
    scopedSlots: { customRender: 'organizationId' }
  },
  {
    title: '代理商',
    width: '10%',
    dataIndex: 'agentName'
  },

  {
    title: '兑换金额',
    width: '10%',
    dataIndex: 'exchangePrice',
    scopedSlots: { customRender: 'exchangePrice' }
  },

  {
    title: '兑换码',
    width: '8%',
    dataIndex: 'redeemCode'
  },

  {
    title: '失败原因',
    width: '10%',
    dataIndex: 'failedReason',
    scopedSlots: { customRender: 'failedReason' }
  },
  {
    title: '状态',
    width: '10%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },
    {
    title: '审核时间',
    width: '10%',
    align: 'center',
    dataIndex: 'passTime',
  },
  {
    title: '操作',
    width: '10%',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'agent',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        serialNumber: null,
        customerPhoneNumber: null,
        organizationId: '',
        agentId: '',
        state: '',
        startTime: '',
        endTime: ''
      }, //搜索查询参数

      dateTime: [],

      columns, //表头
      loadDatas: [], //表格请求的数据
      pagination: false, //不显示分页

      //分页
      pageSizeOptions: ['10', '30', '50', '100'],
      currentPage: 1, //当前的页数
      pageSize: 10, //每页显示的条数
      totalPage: 0, //总页数
      totalCount: 0, //总条数
      loading: true,

      //机构
      institutionList: [],
      //代理商
      agentList: [],

      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      failedReason: null
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    //高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
    },

    //时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    //查询
    queryIntegralRecord() {
      this.getIntegralRecordList()
    },

    //重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.serialNumber = null
      this.queryParam.customerPhoneNumber = null
      this.queryParam.organizationId = ''
      this.queryParam.agentId = ''
      this.queryParam.state = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    //取消
    handleCancel() {
      this.visible = !1
    },

    //确认
    handleOk() {
      let _type = this.editType
      if (_type == 'success') {
        this.setSuccessIntegralRecord()
      } else if (_type == 'fail') {
        const flag = this.checkData()
        flag && this.setFailIntegralRecord()
      } else if (_type == 'export') {
        this.exportIntegralRecord()
      } else if (_type == 'detail') {
        this.handleCancel()
      }
    },

    //操作积分记录
    modifyIntegralRecord(e, o) {
      this.editType = e
      if (this.editType == 'success') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择积分记录项！')
          return false
        } else {
          this.modalTitle = '兑换成功'
          this.visible = !0
        }
      } else if (this.editType == 'fail') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择一条积分记录操作！')
          return false
        } else {
          this.modalTitle = '兑换失败'
          this.visible = !0
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getIntegralRecordInfo(o.id)
      } else {
        this.modalTitle = '导出记录'
        this.visible = !0
      }
    },

    //数据校验
    checkData() {
      let flag = !0
      if (!this.failedReason) {
        flag = !1
        this.$message.warning('请输入兑换失败原因！')
        return false
      } else {
        return flag
      }
    },

    //兑换成功
    setSuccessIntegralRecord() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      successIntegralRecord(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('积分兑换成功！')
            this.getIntegralRecordList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //兑换失败
    setFailIntegralRecord() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      let _data = {
        failedReason: this.failedReason,
        ids: _idsArr
      }
      failIntegralRecord(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('积分兑换失败！')
            this.getIntegralRecordList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //导出
    exportIntegralRecord() {
      let _data = this.queryParam

      exportIntegralRecord(_data)
        .then(res => {
          this.visible = !1

          const content = res
          const blob = new Blob([content])
          const fileName = '积分兑换记录.csv'
          if ('download' in document.createElement('a')) {
            // 非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else {
            // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取积分记录数据列表
    getIntegralRecordList() {
      this.initSelectedRows()
      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getIntegralRecordList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatas = res.page.list
            } else {
              this.loadDatas = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取积分记录信息
    getIntegralRecordInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getIntegralRecordInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.info
            _info.exchangePrice = _info.exchangePrice / 100
            this.forms = _info
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取所有机构
    getInstitutionList() {
      getOrganizationListAll()
        .then(res => {
          if (res.code == 0) {
            const _list = res.info
            if (_list.length > 0) {
              this.institutionList = _list
            } else {
              this.institutionList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取所有代理商
    getAgentList() {
      getAgentListAll()
        .then(res => {
          if (res.code == 0) {
            const _list = res.info
            if (_list.length > 0) {
              this.agentList = _list
            } else {
              this.agentList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getIntegralRecordList()
    }
  },
  created() {
    //列表数据请求
    this.getIntegralRecordList()
    this.getInstitutionList()
    this.getAgentList()
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-table table {
  table-layout: fixed;
}
/deep/ .ant-table table td {
  white-space: nowrap; /*控制单行显示*/
  overflow: hidden; /*超出隐藏*/
  text-overflow: ellipsis; /*隐藏的字符用省略号表示*/
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
.modal-container {
  max-height: 600px;
  padding: 0 12px;
  overflow-y: auto;
}
.exchange-image img {
  max-width: 100%;
}
</style>
