import { axios } from '@/utils/request'
/**
 * 统计分析
 */
// 获取统计分析数据
export const getAnalysisData = (paramObj) => axios.post('/Analyze/info', paramObj)

/**
 * 广告管理
 */
// 添加广告位
export const addAd = (paramObj) => axios.post('/Advertising/add', paramObj)

// 查询广告位
export const getAdInfo = (id) => axios.get('/Advertising/info/' + id)

// 修改广告位
export const modifyAd = (paramObj) => axios.put('/Advertising/modify', paramObj)

// 删除广告位
export const removeAd = (ids) => axios.delete('/Advertising/deleted/' + ids)

// 启用广告位
export const enabledAd = (ids) => axios.put('/Advertising/startAdvertising/' + ids)

// 禁用广告位
export const disabledAd = (ids) => axios.put('/Advertising/stopAdvertising/' + ids)

// 设为首页轮播广告位
export const setHomeAd = (id) => axios.put('/Advertising/putHomeShow/' + id)

// 分页获取广告位
export const getAdList = (paramObj) => axios.post('/Advertising/list', paramObj)

/**
 * 代理商
 */
// 添加代理商
export const addAgent = (paramObj) => axios.post('/agent/add', paramObj)

// 查询代理商
export const getAgentInfo = (id) => axios.get('/agent/info/' + id)

// 修改代理商
export const editAgent = (paramObj) => axios.put('/agent/modify', paramObj)

// 删除代理商
export const removeAgent = (ids) => axios.delete('/agent/deleted/' + ids)

// 启用代理商
export const enabledAgent = (ids) => axios.put('/agent/startAdvertising/' + ids)

// 禁用代理商
export const disabledAgent = (ids) => axios.put('/agent/stopAdvertising/' + ids)

// 分页获取代理商
export const getAgentList = (paramObj) => axios.post('/agent/list', paramObj)

// 获取所有代理商
export const getAgentListAll = () => axios.get('/agent/info/list')

/**
 * 银行机构
 */
// 添加银行机构
export const addOrganization = (paramObj) => axios.post('/organization/add', paramObj)

// 查询银行机构
export const getOrganizationInfo = (id) => axios.get('/organization/info/' + id)

// 修改银行机构
export const editOrganization = (paramObj) => axios.put('/organization/modify', paramObj)

// 删除银行机构
export const removeOrganization = (ids) => axios.delete('/organization/deleted/' + ids)

// 启用银行机构
export const enabledOrganization = (ids) => axios.put('/organization/startAdvertising/' + ids)

// 禁用银行机构
export const disabledOrganization = (ids) => axios.put('/organization/stopAdvertising/' + ids)

// 分页获取银行机构
export const getOrganizationList = (paramObj) => axios.post('/organization/page/list', paramObj)

// 获取所有银行机构
export const getOrganizationListAll = () => axios.get('/organization/info/list')

/**
 * 产品
 */
// 添加产品
export const addProduct = (paramObj) => axios.post('/product/add', paramObj)

// 查询产品
export const getProductInfo = (id) => axios.get('/product/info/' + id)

// 修改产品
export const editProduct = (paramObj) => axios.put('/product/modify', paramObj)

// 删除产品
export const removeProduct = (ids) => axios.delete('/product/deleted/' + ids)

// 启用产品
export const enabledProduct = (ids) => axios.put('/product/startAdvertising/' + ids)

// 禁用产品
export const disabledProduct = (ids) => axios.put('/product/stopAdvertising/' + ids)

// 分页获取产品
export const getProductList = (paramObj) => axios.post('/product/page/list', paramObj)

/**
 * 积分记录
 */
// 查询积分记录
export const getIntegralRecordInfo = (id) => axios.get('/exchange/record/info/' + id)

// 兑换成功积分记录
export const successIntegralRecord = (ids) => axios.put('/exchange/record/startpath/' + ids)

// 兑换失败积分记录
export const failIntegralRecord = (paramObj) => axios.post('/exchange/record/stop/record', paramObj)

// 导出积分记录
export const exportIntegralRecord = (paramObj) => axios.put('/exchange/record/export', paramObj, { responseType: 'blob' })

// 分页获取积分记录
export const getIntegralRecordList = (paramObj) => axios.post('/exchange/record/page/list', paramObj)

/**
 * 兑换流程
 */
// 新增兑换流程
export const addIntegralStep = (paramObj) => axios.post('/exchange/path/add', paramObj)

// 查询兑换流程
export const getIntegralStepInfo = (id) => axios.get('/exchange/path/info/' + id)

// 编辑兑换流程
export const editIntegralStep = (paramObj) => axios.put('/exchange/path/modify', paramObj)

// 删除兑换流程
export const removeIntegralStep = (ids) => axios.delete('/exchange/path/deleted/' + ids)

// 启用兑换流程
export const enabledIntegralStep = (ids) => axios.put('/exchange/path/startpath/' + ids)

// 禁用兑换流程
export const disabledIntegralStep = (ids) => axios.put('/exchange/path/stoppath/' + ids)

// 分页获取兑换流程
export const getIntegralStepList = (paramObj) => axios.post('/exchange/path/page/list', paramObj)
