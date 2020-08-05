<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="流程编号">
              <a-input v-model="queryParam.pathNumber" placeholder="请输入流程编号" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="所属机构">
              <a-select placeholder="请选择" v-model="queryParam.organizationBelongId">
                <a-select-option value="">全部</a-select-option>
                <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
              </a-select>
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
              <a-button type="primary" @click="queryIntegralStep">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyIntegralStep('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyIntegralStep('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyIntegralStep('delete')">删除</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyIntegralStep('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyIntegralStep('disabled')">
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

      <template slot="organizationBelongId" slot-scope="record">
        <a-tag v-if="v.organizationNumber==record" v-for="(v,i) of institutionList" :key="i">{{v.organizationName}}</a-tag>
      </template>

      <template slot="exchangeSample" slot-scope="record">
        <span class="exchange-thumb" v-if="record" @click="handleImgPreview(record)">
          <img :src="record">
        </span>
        <a-icon v-else type="picture" />
      </template>

      <template slot="exchangePath" slot-scope="text, record, index">
        <a v-if="record" @click="modifyIntegralStep('preview',record)">预览</a>
        <!-- <span class="no-data" v-else>
          无内容
        </span> -->
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="modifyIntegralStep('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选兑换流程？</p>
      <p v-else-if="editType=='enabled'">确认启用所选兑换流程？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选兑换流程？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">

            <a-col :md="12" :sm="24">
              <a-form-item label="所属机构" :required="true">
                <a-select v-model="forms.organizationBelongId" :disabled="editType=='detail'" placeholder="请选择">
                  <a-select-option value="" disabled>请选择</a-select-option>
                  <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="流程示意图" :required="true">
                <a-upload :action="action" :headers="headers" :disabled="editType=='detail'" :showUploadList="false" listType="picture-card" :beforeUpload="beforeUpload" @change="handleChange">
                  <img v-if="forms.exchangeSample" :src="forms.exchangeSample" alt="示意图" width="100" height="100" />
                  <div v-else>
                    <a-icon :type="imageLoading ? 'loading' : 'plus'" />
                    <div class="ant-upload-text">Upload</div>
                  </div>
                </a-upload>
              </a-form-item>
            </a-col>

            <a-col :md="24" :sm="24">
              <a-form-item label="兑换流程详情">
                <quill-editor v-model="forms.exchangePath" ref="myQuillEditorB" :disabled="editType=='detail'" :options="editorOption" style="line-height:1.5"></quill-editor>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24" v-show="editType=='edit'||editType=='detail'">
              <a-form-item label="状态">
                <a-select v-model="forms.state" :disabled="editType=='detail'" placeholder="请选择">
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

    <!-- 查看图片模态框 -->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewCancel">
      <img style="width: 100%" :src="previewImage" />
    </a-modal>

    <!-- 手机模态框 -->
    <a-modal :visible="mobileVisible" :footer="null" @cancel="mobileCancel" wrapClassName="mobile-modal">
      <div class="phone">
        <div class="statusbar"></div>
        <div class="mobile-container" v-html="previewDetail"></div>
      </div>
    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor, Quill } from 'vue-quill-editor'
import { ImageExtend, QuillWatch } from 'quill-image-extend-module'
Quill.register('modules/ImageExtend', ImageExtend)
import {
  addIntegralStep,
  getIntegralStepInfo,
  editIntegralStep,
  removeIntegralStep,
  enabledIntegralStep,
  disabledIntegralStep,
  getIntegralStepList,
  getOrganizationListAll
} from '@/api/common'

const columns = [
  { title: '流程编号', width: '15%', dataIndex: 'pathNumber' },
  {
    title: '所属机构',
    width: '10%',
    dataIndex: 'organizationBelongId',
    scopedSlots: { customRender: 'organizationBelongId' }
  },

  {
    title: '示意图',
    width: '10%',
    align: 'center',
    dataIndex: 'exchangeSample',
    scopedSlots: { customRender: 'exchangeSample' }
  },
  {
    title: '兑换详情',
    width: '10%',
    align: 'center',
    dataIndex: 'exchangePath',
    scopedSlots: { customRender: 'exchangePath' }
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
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ align: [] }],
  ['image'],
  ['clean'] // remove formatting button
]

export default {
  name: 'agent',
  components: {
    Pagination,
    quillEditor
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        pathNumber: null,
        organizationBelongId: '',
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
          ImageExtend: {
            loading: true,
            name: 'file',
            headers: xhr => {
              xhr.setRequestHeader('token', this.$ls.get('Access_Token'))
            },
            action: '/gateway/basic/file/upload',
            response: res => {
              return res.url
            }
          },
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function() {
                QuillWatch.emit(this.quill.id)
              }
            }
          }
        }
        // some quill options
      },

      previewVisible: !1,
      previewImage: '',

      mobileVisible: !1,
      previewDetail: null
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    //关闭图片查看
    previewCancel() {
      this.previewVisible = !1
    },

    //查看图片
    handleImgPreview(e) {
      this.previewImage = e
      this.previewVisible = !0
    },

    //关闭手机容器
    mobileCancel() {
      this.mobileVisible = !1
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
    queryIntegralStep() {
      this.getIntegralStepList()
    },

    //重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.pathNumber = null
      this.queryParam.organizationBelongId = ''
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
          this.forms.exchangeSample = imgUrl
        } else {
          this.$message.error('图片上传失败!')
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
        this.deleteIntegralStep()
      } else if (_type == 'enabled') {
        this.enabledIntegralStep()
      } else if (_type == 'disabled') {
        this.disabledIntegralStep()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditIntegralStep()
      }
    },

    //操作兑换流程
    modifyIntegralStep(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          organizationBelongId: '',
          exchangeSample: null,
          exchangePath: null,
          remark: null,
          state: 'enabled'
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getIntegralStepInfo()
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
        this.getIntegralStepInfo(o.id)
      } else if (this.editType == 'preview') {
        this.getIntegralStepInfo(o.id)
      }
    },

    //数据校验
    checkData() {
      let flag = !0
      if (!this.forms.organizationBelongId) {
        flag = !1
        this.$message.warning('请选择所属机构！')
        return false
      } else if (!this.forms.exchangeSample) {
        flag = !1
        this.$message.warning('请上传兑换示意图！')
        return false
      } else if (!this.forms.exchangePath) {
        flag = !1
        this.$message.warning('请输入兑换详情！')
        return false
      } else {
        return flag
      }
    },

    //添加OR编辑
    addOrEditIntegralStep() {
      let _type = this.editType
      let _data = this.forms

      switch (_type) {
        case 'add':
          addIntegralStep(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getIntegralStepList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          editIntegralStep(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getIntegralStepList()
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
    deleteIntegralStep() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeIntegralStep(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('兑换流程已删除！')
            this.getIntegralStepList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //启用
    enabledIntegralStep() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledIntegralStep(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getIntegralStepList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //禁用
    disabledIntegralStep() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledIntegralStep(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getIntegralStepList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取兑换流程数据列表
    getIntegralStepList() {
      this.initSelectedRows()

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getIntegralStepList(_data)
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

    //获取兑换流程信息
    getIntegralStepInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getIntegralStepInfo(_id)
        .then(res => {
          if (res.code == 0) {
            if (this.editType == 'preview') {
              this.mobileVisible = !0
              this.previewDetail = res.info.exchangePath
            } else {
              this.visible = !0
              this.forms = res.info
            }
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

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getIntegralStepList()
    }
  },
  created() {
    //列表数据请求
    this.getIntegralStepList()
    this.getInstitutionList()
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
  height: 300px;
}
.exchange-thumb {
  display: inline-block;
  width: 80px;
  height: 45px;
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  img {
    width: 100%;
  }
}

.phone {
  margin: 0 auto;
  position: relative;
  background: #111;
  border-radius: 55px;
  box-shadow: 0px 0px 0px 2px #aaa;
  width: 320px;
  height: 568px;
  padding: 105px 25px;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
}

.phone .mobile-container {
  width: 320px;
  height: 100%;
  display: block;
  width: 100%;
  margin-top: 20px;
  background: #fff;
  overflow: auto;
}

.phone:before {
  content: '';
  width: 60px;
  height: 10px;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  margin-left: -30px;
  background: #333;
  top: 50px;
}

.phone .statusbar {
  position: absolute;
  width: 320px;
  height: 20px;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAAoCAIAAADhf9zeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REEyN0EzRUU1QzM3MTFFNEE1ODA5RkNEOEU4MEU4ODYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REEyN0EzRUY1QzM3MTFFNEE1ODA5RkNEOEU4MEU4ODYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpEQTI3QTNFQzVDMzcxMUU0QTU4MDlGQ0Q4RTgwRTg4NiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpEQTI3QTNFRDVDMzcxMUU0QTU4MDlGQ0Q4RTgwRTg4NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuHAU7gAAA6nSURBVHja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');
  left: 50%;
  margin-left: -160px;
  top: 100px;
  -webkit-background-size: 100% auto;
  background-size: 100% auto;
}

.phone:after {
  content: '';
  position: absolute;
  width: 60px;
  height: 60px;
  left: 50%;
  margin-left: -30px;
  bottom: 20px;
  border-radius: 100%;
  box-sizing: border-box;
  border: 5px solid #333;
}
</style>
