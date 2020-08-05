<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="机构编号">
              <a-input v-model="queryParam.organizationNumber" placeholder="请输入机构编码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="机构名称">
              <a-input v-model="queryParam.organizationName" placeholder="请输入机构名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
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
              <a-button type="primary" @click="queryBank">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyBank('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyBank('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyBank('delete')">删除</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyBank('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyBank('disabled')">
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

      <template slot="organizationLogo" slot-scope="record">
        <img v-if="record" :src="record" style="display: inline-block;width: 80px;">
        <a-icon v-else type="picture" />
      </template>

      <template slot="exchangeIntroduction" slot-scope="record">
        <a v-if="record" @click="modifyBank('preview',record)">查看</a>
        <span class="no-data" v-else>
          无内容
        </span>
      </template>

      <template slot="querySpecification" slot-scope="record">
        <a v-if="record" @click="modifyBank('preview',record)">查看</a>
        <span class="no-data" v-else>
          无内容
        </span>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="modifyBank('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选机构？</p>
      <p v-else-if="editType=='enabled'">确认启用所选机构？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选机构？</p>
      <div class="modal-container" v-else-if="editType=='preview'">
        <div v-html="previewContent"></div>
      </div>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="机构名称" :labelCol="{ span: 24 }" :wrapper-col="{ span: 12 }" :required="true">
                <a-input v-model="forms.organizationName" :disabled="editType=='detail'" placeholder="请输入机构名称" />
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="机构Logo" :required="true">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" :showUploadList="false" listType="picture-card" :beforeUpload="beforeUpload" @change="handleChange">
                  <img v-if="forms.organizationLogo" :src="forms.organizationLogo" alt="logo" width="100" />
                  <div v-else>
                    <a-icon :type="imageLoading ? 'loading' : 'plus'" />
                    <div class="ant-upload-text">Upload</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="积分兑换简介">
                <quill-editor v-model="forms.exchangeIntroduction" ref="myQuillEditorA" :disabled="editType=='detail'" :options="editorOption" style="line-height:1.5"></quill-editor>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="积分查询说明">
                <quill-editor v-model="forms.querySpecification" ref="myQuillEditorB" :disabled="editType=='detail'" :options="editorOption" style="line-height:1.5"></quill-editor>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24" v-show="editType=='edit'||editType=='detail'">
              <a-form-item label="状态">
                <a-select v-model="forms.state" :disabled="editType=='detail'" placeholder="请选择">
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
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
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import {
  addOrganization,
  getOrganizationInfo,
  editOrganization,
  removeOrganization,
  enabledOrganization,
  disabledOrganization,
  getOrganizationList
} from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  { title: '机构编码', width: '15%', dataIndex: 'organizationNumber' },
  {
    title: '机构名称',
    width: '14%',
    dataIndex: 'organizationName'
  },
  {
    title: '机构Logo',
    width: '10%',
    align: 'center',
    dataIndex: 'organizationLogo',
    scopedSlots: { customRender: 'organizationLogo' }
  },
  {
    title: '积分兑换简介',
    width: '13%',
    dataIndex: 'exchangeIntroduction',
    scopedSlots: { customRender: 'exchangeIntroduction' }
  },
  {
    title: '积分查询说明',
    width: '13%',
    dataIndex: 'querySpecification',
    scopedSlots: { customRender: 'querySpecification' }
  },
  {
    title: '状态',
    width: '10%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
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
var toolbarOptions = [
  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ align: [] }],
  ['clean'] // remove formatting button
]

export default {
  name: 'bank',
  components: {
    Pagination,
    quillEditor
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        organizationNumber: null,
        organizationName: null,
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

      selectedRowKeys: [], //选中行键
      selectedRows: [], //选中行键值,

      forms: {},
      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      action: '/gateway/basic/file/upload',
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1,

      editorOption: {
        placeholder: '请输入文本...',
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
        // some quill options
      },

      previewContent: ''
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
    queryBank() {
      this.getBankList()
    },

    //重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.organizationNumber = null
      this.queryParam.organizationName = null
      this.queryParam.state = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    //选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    //文件上传前过滤
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isGIF = file.type === 'image/gif'
      const isPNG = file.type === 'image/png'
      const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isGIF && !isPNG && !isBMP) {
        this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }

      return (isJPG || isBMP || isGIF || isPNG) && isLt2M
    },

    //上传后回掉
    handleChange(info) {
      if (info.file.status === 'uploading') {
        this.imageLoading = !0
        return
      }
      if (info.file.status == 'done') {
        this.imageLoading = !1
        if (info.file.response.code == 0) {
          const imgUrl = info.file.response.url
          this.forms.organizationLogo = imgUrl
        } else {
          this.$message.error('Logo上传失败!')
        }
      }
    },

    //取消
    handleCancel() {
      this.visible = !1
    },

    //确认
    handleOk() {
      let _type = this.editType
      if (_type == 'delete') {
        this.deleteBank()
      } else if (_type == 'enabled') {
        this.enabledBank()
      } else if (_type == 'disabled') {
        this.disabledBank()
      } else if (_type == 'detail' || _type == 'preview') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditBank()
      }
    },

    //操作机构
    modifyBank(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          organizationName: null,
          organizationLogo: null,
          exchangeIntroduction: null,
          querySpecification: null,
          remark: null,
          state: 'enabled'
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getBankInfo()
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
      } else if (this.editType == 'preview') {
        this.modalTitle = '详情'
        this.previewContent = o
        this.visible = !0

      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.getBankInfo(o.id)
      }
    },

    //数据校验
    checkData() {
      let flag = !0
      if (!this.forms.organizationName) {
        flag = !1
        this.$message.warning('请输入机构名称！')
        return false
      } else if (!this.forms.organizationLogo) {
        flag = !1
        this.$message.warning('请上传机构Logo！')
        return false
      } else {
        return flag
      }
    },

    //添加编辑
    addOrEditBank() {
      let _type = this.editType
      let _data = this.forms
      console.log(_data)
      switch (_type) {
        case 'add':
          addOrganization(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBankList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          editOrganization(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getBankList()
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
    deleteBank() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeOrganization(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('机构已删除！')
            this.getBankList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //启用
    enabledBank() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledOrganization(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getBankList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //禁用
    disabledBank() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledOrganization(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getBankList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取机构数据列表
    getBankList() {
      this.initSelectedRows()

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getOrganizationList(_data)
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

    //获取机构信息
    getBankInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getOrganizationInfo(_id)
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
      this.getBankList()
    }
  },
  created() {
    //列表数据请求
    this.getBankList()
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
.no-data {
  color: #999;
}
/deep/ .quill-editor:not(.bubble) .ql-container,
.quill-editor:not(.bubble) .ql-container .ql-editor {
  height: 80px;
}
</style>
