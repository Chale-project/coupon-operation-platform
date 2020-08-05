<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="代理商编号">
              <a-input v-model="queryParam.agentId" placeholder="请输入代理商编码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="代理商名称">
              <a-input v-model="queryParam.agentName" placeholder="请输入代理商名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.agentState">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="创建时间">
                <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryAgent">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyAgent('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyAgent('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyAgent('delete')">删除</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyAgent('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyAgent('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="linkmanPhoneNumber" slot-scope="record">
        {{mobileToStar(record)}}
      </template>

      <template slot="agentUrl" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            <a :href="record" target="_blank" v-if="record">{{record}}</a>
          </template>
          <a @click="doCopy(record)">复制地址</a>
        </a-tooltip>
      </template>

      <template slot="agentState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="modifyAgent('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选代理商？</p>
      <p v-else-if="editType=='enabled'">确认启用所选代理商？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选代理商？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="代理商名称" :required="true">
                <a-input v-model="forms.agentName" :disabled="editType=='detail'" placeholder="请输入代理商名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="联系人" :required="true">
                <a-input v-model="forms.linkmanName" :disabled="editType=='detail'" placeholder="请输入联系人名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人电话" :required="true">
                <a-input v-model="forms.linkmanPhoneNumber" maxlength="11" :disabled="editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24" v-show="editType=='edit'||editType=='detail'">
              <a-form-item label="状态">
                <a-select v-model="forms.agentState" :disabled="editType=='detail'" placeholder="请选择">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="备注">
                <a-textarea v-model="forms.remark" :disabled="editType=='detail'" placeholder="请输入备注" />
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
import { addAgent, getAgentInfo, editAgent, removeAgent, enabledAgent, disabledAgent, getAgentList } from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  { title: '代理商编码', width: '15%', dataIndex: 'agentId' },
  {
    title: '代理商名称',
    width: '10%',
    dataIndex: 'agentName'
  },
  {
    title: '联系人',
    width: '10%',
    dataIndex: 'linkmanName'
  },
  {
    title: '手机号',
    width: '15%',
    dataIndex: 'linkmanPhoneNumber',
    scopedSlots: { customRender: 'linkmanPhoneNumber' }
  },
  {
    title: '代理商链接',
    width: '10%',
    align: 'center',
    dataIndex: 'agentUrl',
    scopedSlots: { customRender: 'agentUrl' }
  },
  {
    title: '状态',
    width: '15%',
    align: 'center',
    dataIndex: 'agentState',
    scopedSlots: { customRender: 'agentState' }
  },
  {
    title: '创建时间',
    width: '15%',
    align: 'center',
    dataIndex: 'addDataTime'
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
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        agentId: null,
        agentName: null,
        agentState: '',
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

      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1
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
    queryAgent() {
      this.getAgentList()
    },

    //重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.agentId = null
      this.queryParam.agentName = null
      this.queryParam.agentState = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    //复制
    doCopy(text) {
      this.$copyText(text)
        .then(message => {
          this.$message.success('复制成功！')
        })
        .catch(err => {
          this.$message.error('复制失败！')
        })
    },

    //取消
    handleCancel() {
      this.visible = !1
    },

    //确认
    handleOk() {
      let _type = this.editType
      if (_type == 'delete') {
        this.deleteAgent()
      } else if (_type == 'enabled') {
        this.enabledAgent()
      } else if (_type == 'disabled') {
        this.disabledAgent()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditAgent()
      }
    },

    //操作代理商
    modifyAgent(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          agentName: null,
          linkmanName: null,
          linkmanPhoneNumber: null,
          remark: null,
          agentState: 'enabled'
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getAgentInfo()
        }
      } else if (this.editType == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项！')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getAgentInfo(o.id)
      }
    },

    //数据校验
    checkData() {
      let flag = !0
      let mobileReg = /^(1)[0-9]{10}$/
      if (!this.forms.agentName) {
        flag = !1
        this.$message.warning('请输入代理商名称！')
        return false
      } else if (!this.forms.linkmanName) {
        flag = !1
        this.$message.warning('请输入联系人！')
        return false
      } else if (!mobileReg.test(this.forms.linkmanPhoneNumber)) {
        flag = !1
        this.$message.warning('请输入有效的手机号！')
        return false
      } else {
        return flag
      }
    },

    //添加店铺
    addOrEditAgent() {
      let _type = this.editType
      let _data = this.forms

      switch (_type) {
        case 'add':
          addAgent(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAgentList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          editAgent(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getAgentList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
      }
    },

    //删除
    deleteAgent() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeAgent(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('代理商已删除！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //启用
    enabledAgent() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledAgent(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //禁用
    disabledAgent() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledAgent(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getAgentList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取代理商数据列表
    getAgentList() {
      this.initSelectedRows()

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getAgentList(_data)
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

    //获取代理商信息
    getAgentInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getAgentInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.info
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
      this.getAgentList()
    }
  },
  created() {
    //列表数据请求
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
</style>
