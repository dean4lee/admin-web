<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>登陆日志</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <el-form inline :model="searchParam" size="small" class="search">
      <el-form-item label="搜索：">
        <el-input v-model="searchParam.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchParam.ip" placeholder="ip"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.status" placeholder="登陆状态" clearable>
          <el-option label="成功" value="true"/>
          <el-option label="失败" value="false"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchData">查询</el-button>
      </el-form-item>
    </el-form>
    <!-- 表单 -->
    <el-table :data="logData" border highlight-current-row v-loading="loading" element-loading-text="拼命加载中"
              style="width: 100%">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="username" label="用户名" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column prop="osName" label="设备型号" min-width="100" align="center"/>
      <el-table-column prop="deviceType" label="设备类型" min-width="100" align="center"/>
      <el-table-column prop="ip" label="ip" min-width="100" align="center"/>
      <el-table-column prop="loginTime" label="登陆时间" min-width="100" align="center"/>
      <el-table-column prop="status" label="登陆状态" min-width="100" align="center" :formatter="statusFormatter"/>
      <el-table-column prop="failInfo" label="登陆失败信息" min-width="100" align="center" :show-overflow-tooltip="true"/>
    </el-table>
    <!-- 分页 -->
    <div class="block">
      <el-pagination
        layout="prev, pager, next"
        @current-change="loadData"
        :current-page.sync="searchParam.pageNum"
        :page-size="searchParam.pageSize"
        :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //查询数据的参数
        searchParam: {
          pageSize: 10,
          pageNum: 1,
          username: null,
          ip: null,
          status: null
        },
        //table数据
        logData: [],
        //table数据总条数
        total: 0,
        //加载动画
        loading: false,
      }
    },
    created() {
      this.loadData();
    },
    methods: {
      /**
       * 加载table数据
       */
      loadData() {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + '/log/login/list', {
          params: this.searchParam,
          withCredentials: true
        }).then(res => {
          this.total = res.data.total;
          this.logData = res.data.data;
          this.loading = false;
        }).catch(e => {
          this.$message.error(e.response.data.msg);
          this.loading = false;
        })
      },
      /**
       * 搜索查询
       */
      searchData() {
        this.searchParam.pageNum = 1;
        this.loadData();
      },
      /**
       * 登陆状态格式化
       * @param row
       * @param column
       * @param cellValue
       * @param index
       * @returns {string}
       */
      statusFormatter(row, column, cellValue, index) {
        if (cellValue) {
          return '成功';
        } else {
          return '失败'
        }
      },
    }
  }
</script>

<style scoped>
  .search {
    padding-top: 20px;
    text-align: left;
  }
</style>
