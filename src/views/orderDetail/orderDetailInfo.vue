<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">

      <a-card :bordered="false">
        <detail-list title="订单信息">
          <detail-list-item term="订单编号">{{info.orderId}}</detail-list-item>
          <detail-list-item term="订单状态">{{info.orderStatus}}</detail-list-item>
          <detail-list-item term="下单时间">{{info.orderCreateTime}}</detail-list-item>
          <detail-list-item term="支付方式">{{info.payment.paymentType}}</detail-list-item>
          <detail-list-item term="出库时间">{{info.commodityStockOutTime}}</detail-list-item>
          <detail-list-item term="完成时间">{{info.orderFinishTime}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="收货人信息">
          <detail-list-item term="收货人">{{info.receiver.receiverName}}</detail-list-item>
          <detail-list-item term="联系电话">{{info.receiver.receiverTelephone}}</detail-list-item>
          <detail-list-item term="联系手机">{{info.receiver.receiverPhoneNumber}}</detail-list-item>
          <p><span style="color:rgba(0,0,0,.85)">取货地址：</span>{{info.receiver.receiverAddress}}</p>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="支付信息">
          <detail-list-item term="支付方式">{{info.payment.paymentType}}</detail-list-item>
          <detail-list-item term="商品总额">{{info.payment.commodityTotalAmount}}</detail-list-item>
          <detail-list-item term="运费金额">{{info.payment.freightAmount}}</detail-list-item>
          <detail-list-item term="促销优惠">{{info.payment.promotionalAmount}}</detail-list-item>
          <detail-list-item term="优惠券">{{info.payment.couponAmount}}</detail-list-item>
          <detail-list-item term="积分">{{info.payment.integral}}</detail-list-item>
          <detail-list-item term="应付金额">{{info.payment.payableAmount}}</detail-list-item>
          <detail-list-item term="支付时间">{{info.payment.paymentTime}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="配送信息">
          <detail-list-item term="配送方式">{{info.delivery.deliveryMode}}</detail-list-item>
          <detail-list-item term="运费">{{info.delivery.deliveryFreight}}</detail-list-item>
          <detail-list-item term="配送日期">{{info.delivery.deliveryTime}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <div class="card-item-title">物流信息</div>
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <div class="delivery-title">
              <a-icon type="gift" />包裹</div>
            <div class="delivery-content">
              <p class="delivery-content-list">送货方式：{{info.logistics.deliveryMode}}</p>
              <p class="delivery-content-list">承运单号：{{info.logistics.deliveryOrderNo}}</p>
              <p class="delivery-content-list">承运公司：{{info.logistics.deliveryCompany}}</p>
              <p class="delivery-content-list">承运人电话：{{info.logistics.deliveryPhoneNumber}}</p>
            </div>
          </a-col>

          <a-col :md="16" :sm="24">
            <div class="logistics-logs">
              <a-timeline>
                <a-timeline-item :color="i==0?'green':'gray'" v-for="(v,i) of info.logistics.deliveryLogs" :key="i">{{v.itemInfo}} {{v.itemTime}}</a-timeline-item>
              </a-timeline>
            </div>
          </a-col>
        </a-row>
        <a-divider style="margin-bottom: 32px" />

        <detail-list title="发票信息">
          <detail-list-item term="发票类型">{{info.invoice.invoiceType}}</detail-list-item>
          <detail-list-item term="纳税人姓名">{{info.invoice.taxpayerName}}</detail-list-item>
          <detail-list-item term="纳税人识别号">{{info.invoice.taxpayerTaxNumber}}</detail-list-item>
          <detail-list-item term="纳税人开户银行">{{info.invoice.taxpayerOpenBankName}}</detail-list-item>
          <detail-list-item term="纳税人开户银行账号">{{info.invoice.taxpayerBankAccount}}</detail-list-item>
          <detail-list-item term="纳税人地址">{{info.invoice.taxpayerAddress}}</detail-list-item>
          <detail-list-item term="发票内容">{{info.invoice.invoiceContent}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

        <div class="card-item-title">订单商品</div>
        <a-table size="middle" :scroll="{ x: 1100}" style="margin-bottom: 24px" :columns="goodsColumns" :dataSource="info.commodityList" :pagination="pagination">
          <template slot="skuName" slot-scope="record">
            <a-tooltip placement="topLeft">
              <template slot='title'>
                {{record}}
              </template>
              {{record}}
            </a-tooltip>
          </template>

          <template slot="skuHref" slot-scope="record">
            <a-tooltip placement="topLeft">
              <template slot='title'>
                <a :href="record" target="_blank">{{record}}</a>
              </template>
              <a :href="record" target="_blank">{{record}}</a>
            </a-tooltip>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script>
import Pagination from "@/components/pagination/pagination";
import DetailList from "@/components/tools/DetailList";
const DetailListItem = DetailList.Item;


const goodsColumns = [
  { title: "商品编号", width: 120, dataIndex: "skuId", fixed: "left" },
  {
    title: "商品名称",
    width: 300,
    dataIndex: "skuName",
    scopedSlots: { customRender: "skuName" }
  },
  {
    title: "商品链接",
    width: 220,
    align: "center",
    dataIndex: "skuHref",
    scopedSlots: { customRender: "skuHref" }
  },
  { title: "商品原价", width: 120, dataIndex: "skuPrice" },
  {
    title: "商品折扣价",
    width: 120,
    dataIndex: "skuDiscountPrice"
  },
  { title: "数量", width: 100, dataIndex: "skuCount" }
];
export default {
  name: "orderList",
  components: {
    Pagination,
    DetailList,
    DetailListItem
  },
  data() {
    return {
      pagination: false, //不显示分页

      info: {
        orderId: null,
        orderCreateTime: null, // 下单时间
        paymentTime: null, // 支付时间
        commodityStockOutTime: null, //出库时间
        orderFinishTime: null, // 完成时间
        orderStatus: null,
        commodityList: [], //商品数据
        payment: {}, // 支付信息
        delivery: {}, // 物流信息
        invoice: {}, // 发票信息
        receiver: {}, // 收货人信息
        logistics: {} // 物流详情
      },
      goodsColumns, //商品表头
      editType: "detail",
      modalTitle: "详情",
      visible: !1,
      confirmLoading: !1
    };
  },

  methods: {
    //获取订单信息
    getOrderInfo(id) {
      this.axios({
        url: "order/info/" + 83854085206,
        method: METHOD_GET
      })
        .then(res => {
          if (res.code == 0) {
            this.visible = !0;
            const _info = res.result;
            this.info.orderId = _info.orderId;
            this.info.orderCreateTime = _info.orderCreateTime;
            this.info.paymentTime = _info.paymentTime;
            this.info.commodityStockOutTime = _info.commodityStockOutTime;
            this.info.orderFinishTime = _info.orderFinishTime;
            this.info.orderStatus = _info.orderStatus;
            this.info.commodityList = _info.commodityList;
            this.info.payment = _info.payment;
            this.info.delivery = _info.delivery;
            this.info.invoice = _info.invoice;
            this.info.receiver = _info.receiver;
            this.info.logistics = _info.logistics;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  created() {
    console.log(this.$route);
    //列表数据请求
    this.getOrderInfo();
  }
};
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
  .card-item-title {
    color: rgba(0, 0, 0, 0.85);
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .delivery-title {
    color: rgba(0, 0, 0, 0.8);
    font-size: 14px;
    margin-bottom: 16px;
  }
  .delivery-content {
    color: rgba(0, 0, 0, 0.65);
  }
  .logistics-logs {
    height: 200px;
    padding: 5px 0;
    overflow-y: auto;
  }
}
</style>
