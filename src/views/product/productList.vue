<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="商品编号">
              <a-input v-model="queryParam.productNumber" placeholder="请输入商品编码" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="商品名称">
              <a-input v-model="queryParam.productName" placeholder="请输入商品名称" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="所属机构">
                <a-select placeholder="请选择" v-model="queryParam.organizationBelongId">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
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
              <a-button type="primary" @click="queryProduct">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="modifyProduct('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="modifyProduct('edit')">编辑</a-button>
      <a-button type="primary" icon="delete" @click="modifyProduct('delete')">删除</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="modifyProduct('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="modifyProduct('disabled')">
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
      <template slot="productName" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>

      <template slot="organizationBelongId" slot-scope="record">
        <a-tag v-if="v.organizationNumber==record" v-for="(v,i) of institutionList" :key="i">{{v.organizationName}}</a-tag>
      </template>

      <template slot="allowExchangeNum" slot-scope="record">
        <span v-if="record>=0">{{record}}</span>
        <span v-else>不限</span>
      </template>

      <template slot="exchangePrice" slot-scope="record">
        {{record/100}}元
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>
      <template slot="Action" slot-scope="text, record, index">
        <a @click="modifyProduct('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'800px':editType=='edit'?'800px':editType=='detail'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选商品？</p>
      <p v-else-if="editType=='enabled'">确认启用所选商品？</p>
      <p v-else-if="editType=='disabled'">确认禁用所选商品？</p>
      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24">
              <a-form-item label="商品名称" :required="true">
                <a-input v-model="forms.productName" :disabled="editType=='detail'" placeholder="请输入商品名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="所属机构" :required="true">
                <a-select v-model="forms.organizationBelongId" :disabled="editType=='detail'" placeholder="请选择">
                  <a-select-option value="" disabled>请选择</a-select-option>
                  <a-select-option :value="v.organizationNumber" v-for="(v,i) in institutionList" :key="i">{{v.organizationName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="兑换积分数" :required="true">
                <a-input type="number" v-model="forms.creditsExchangeNum" :disabled="editType=='detail'" placeholder="请输入兑换积分数" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="允许兑换次数" :required="true">
                <a-input type="number" v-model="forms.allowExchangeNum" :disabled="editType=='detail'" placeholder="请输入允许兑换次数（数值小于0表示不限量）" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="兑换价格" :required="true">
                <a-input type="number" v-model="forms.exchangePrice" :disabled="editType=='detail'" placeholder="请输入兑换价格（最小单位元，小数点后最多两位）" />
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
  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import {
  addProduct,
  getProductInfo,
  editProduct,
  removeProduct,
  enabledProduct,
  disabledProduct,
  getProductList,
  getOrganizationListAll
} from '@/api/common'

const columns = [
  { title: '商品编码', width: '15%', dataIndex: 'productNumber' },
  {
    title: '商品名称',
    width: '10%',
    dataIndex: 'productName',
    scopedSlots: { customRender: 'productName' }
  },
  {
    title: '所属机构',
    width: '10%',
    dataIndex: 'organizationBelongId',
    scopedSlots: { customRender: 'organizationBelongId' }
  },
  {
    title: '兑换积分数',
    width: '10%',
    dataIndex: 'creditsExchangeNum'
  },
  {
    title: '允许兑换次数',
    width: '10%',
    dataIndex: 'allowExchangeNum',
    scopedSlots: { customRender: 'allowExchangeNum' }
  },
  {
    title: '兑换价',
    width: '10%',
    align: 'center',
    dataIndex: 'exchangePrice',
    scopedSlots: { customRender: 'exchangePrice' }
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

export default {
  name: 'agent',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        productNumber: null,
        productName: null,
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
    queryProduct() {
      this.getProductList()
    },

    //重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.productNumber = null
      this.queryParam.productName = null
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

    //取消
    handleCancel() {
      this.visible = !1
    },

    //确认
    handleOk() {
      let _type = this.editType
      if (_type == 'delete') {
        this.deleteProduct()
      } else if (_type == 'enabled') {
        this.enabledProduct()
      } else if (_type == 'disabled') {
        this.disabledProduct()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditProduct()
      }
    },

    //操作商品
    modifyProduct(e, o) {
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          productName: null,
          creditsExchangeNum: null,
          allowExchangeNum: null,
          exchangePrice: null,
          organizationBelongId: '',
          remark: null,
          state: 'enabled'
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getProductInfo()
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
        this.getProductInfo(o.id)
      }
    },

    //数据校验
    checkData() {
      let flag = !0
      let priceReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      if (!this.forms.productName) {
        flag = !1
        this.$message.warning('请输入商品名称！')
        return false
      } else if (!this.forms.organizationBelongId) {
        flag = !1
        this.$message.warning('请选择所属机构！')
        return false
      } else if (!this.forms.creditsExchangeNum) {
        flag = !1
        this.$message.warning('请输入兑换积分数！')
        return false
      } else if (!this.forms.allowExchangeNum) {
        flag = !1
        this.$message.warning('请输入允许兑换次数！')
        return false
      } else if (!priceReg.test(this.forms.exchangePrice)) {
        flag = !1
        this.$message.warning('请输入有效的兑换价格！')
        return false
      } else {
        return flag
      }
    },

    //添加店铺
    addOrEditProduct() {
      let _type = this.editType
      let _data = { ...this.forms }
      _data.exchangePrice = _data.exchangePrice * 100
      switch (_type) {
        case 'add':
          addProduct(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getProductList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          editProduct(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getProductList()
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
    deleteProduct() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeProduct(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('商品已删除！')
            this.getProductList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //启用
    enabledProduct() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledProduct(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getProductList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //禁用
    disabledProduct() {
      let _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      disabledProduct(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getProductList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取商品数据列表
    getProductList() {
      this.initSelectedRows()

      let _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getProductList(_data)
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

    //获取商品信息
    getProductInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getProductInfo(_id)
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

    //分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getProductList()
    }
  },
  created() {
    //列表数据请求
    this.getProductList()
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
</style>
