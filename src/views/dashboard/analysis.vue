<template>
  <div class="page-header-index-wide">
    <a-card title="统计分析" :loading="loading" :bordered="false" :style="{marginBottom:'20px'}">
      <div class="extra-wrapper" slot="extra">
        <div class="extra-item">
          <a-tabs :tabBarGutter="5" :activeKey="time" @change="checkDateTimeQuick">
            <a-tab-pane :tab="v.value" :key="v.key" v-for="v in extraData"></a-tab-pane>
          </a-tabs>
        </div>
        <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" :style="{width: '256px'}" />
      </div>
      <a-row :gutter="24">
        <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="交易笔数" :total="infoData.exchangeCount.amount | NumberFormat">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <template slot="footer">
              <div class="trade-wrapper">
                <div class="trade-success">
                  <a-badge status="success" /><span>成功 {{infoData.exchangeCount.successNum}}</span>
                </div>
                <div class="trade-failed">
                  <a-badge status="error" />失败 {{infoData.exchangeCount.failedNum}}
                </div>
              </div>
            </template>
          </chart-card>
        </a-col>
        <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="总交易额" :total="infoData.exchangeMoney.amount/100 | NumberFormat">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <mini-bar />
            </div>
            <template slot="footer">日均交易额 <span>￥{{infoData.exchangeMoney.averageNum/100 | NumberFormat}}</span></template>
          </chart-card>
        </a-col>
        <a-col :sm="24" :md="12" :xl="8" :style="{ marginBottom: '24px' }">
          <chart-card :loading="loading" title="访问量" :total="infoData.visits.amount | NumberFormat">
            <a-tooltip title="指标说明" slot="action">
              <a-icon type="info-circle-o" />
            </a-tooltip>
            <div>
              <mini-area />
            </div>
            <template slot="footer">日访问量<span> {{ infoData.visits.averageNum }}</span></template>
          </chart-card>
        </a-col>
      </a-row>
    </a-card>

  </div>
</template>

<script>
import ChartCard from '@/components/chart/ChartCard'
import ACol from 'ant-design-vue/es/grid/Col'
import ATooltip from 'ant-design-vue/es/tooltip/Tooltip'
import MiniArea from '@/components/chart/MiniArea'
import MiniBar from '@/components/chart/MiniBar'
import MiniProgress from '@/components/chart/MiniProgress'
import RankList from '@/components/chart/RankList'
import Bar from '@/components/chart/Bar'
import Trend from '@/components/Trend'

import { getAnalysisData } from '@/api/common'

export default {
  name: 'analysis',
  components: {
    ATooltip,
    ACol,
    ChartCard,
    MiniArea,
    MiniBar,
    MiniProgress,
    RankList,
    Bar,
    Trend
  },
  data() {
    return {
      loading: true,
      extraData: [
        { key: 'yesterday', value: '昨日' },
        { key: 'today', value: '今日' },
        { key: 'week', value: '本周' },
        { key: 'month', value: '本月' },
        { key: 'threeMonth', value: '近三个月' },
        { key: '', value: '所有' }
      ],
      time: '',
      startTime: null,
      endTime: null,
      dateTime: [],

      infoData: {
        exchangeCount: {},
        exchangeMoney: {},
        visits: {}
      }
    }
  },
  created() {
    this.getAnalysis()
  },

  methods: {
    //时间标签快捷选择
    checkDateTimeQuick(e) {
      this.dateTime = []
      this.time = e
      this.getAnalysis()
    },

    //时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.startTime = l[0]
      this.endTime = l[1]
      this.time = ''

      this.getAnalysis()
    },

    //获取数据总览
    getAnalysis() {
      const _data = {
        startTime: this.startTime,
        endTime: this.endTime,
        time: this.time
      }
      getAnalysisData(_data)
        .then(res => {
          if (res.code == 0) {
            this.loading = !1
            this.infoData = res.info
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

<style lang="less" scoped>
.extra-wrapper {
  .extra-item {
    display: inline-block;
    margin-right: 24px;
    /deep/ .ant-tabs-bar {
      margin: 0 0 6px 0;
    }
    a {
      margin-left: 24px;
    }
  }
}

.trade-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .trade-success {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1;
  }
  .trade-failed {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: right;
    flex: 1;
  }
  .ant-badge-status {
    line-height: 1;
  }
}
</style>
