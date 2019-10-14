<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户组</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <el-form inline :model="searchParam" size="small" class="search">
      <el-form-item label="搜索：">
        <el-input v-model="searchParam.keyword" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.roleId" placeholder="角色" clearable>
          <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchData">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="perm.add" @click="visibleEditForm">添加</el-button>
      </el-form-item>
    </el-form>
    <!-- 表单 -->
    <el-table :data="groupData" border highlight-current-row v-loading="loading" element-loading-text="拼命加载中"
              style="width: 100%">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="name" label="名称" min-width="100" align="center"/>
      <el-table-column prop="roles" label="角色" min-width="100" align="center" :formatter="roleFormatter"
                       :show-overflow-tooltip="true"/>
      <el-table-column prop="remark" label="备注" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" v-if="perm.update" @click="visibleEditForm(scope.row)">编辑</el-button>
          <el-button size="mini" v-if="perm.delete" type="danger" @click="deleteGroup(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
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
    <!-- 用户组新增 -->
    <el-dialog title="添加" :visible.sync="dialogForm.add" width="30%" @close="closeEditFrom(true)" class="dialogStyle">
      <el-form label-width="80px" ref="addParam" :model="addParam" :rules="rules.add">
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="addParam.name"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="addParam.remark"/>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="addParam.roleIds" placeholder="请选择" multiple clearable>
            <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(true)">取 消</el-button>
        <el-button type="primary" @click="addGroup()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 用户组修改 -->
    <el-dialog title="修改" :visible.sync="dialogForm.update" width="30%" class="dialogStyle"
               @close="closeEditFrom(false)">
      <el-form label-width="80px" ref="updateParam" :model="updateParam" :rules="rules.update">
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="updateParam.name"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="updateParam.remark"/>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="updateParam.roleIds" placeholder="请选择" multiple clearable>
            <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(false)">取 消</el-button>
        <el-button type="primary" @click="updateGroup()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //查询数据的参数
        searchParam: {
          keyword: null,
          pageSize: 10,
          pageNum: 1,
          roleId: null
        },
        //操作按钮显示和英藏
        perm: {
          add: false,
          update: false,
          delete: false
        },
        //表单数据
        groupData: [],
        //角色数据
        roleData: [],
        //数据总条数
        total: 0,
        loading: false,
        //添加修改页面显示
        dialogForm: {
          add: false,
          update: false
        },
        //添加用户组的参数
        addParam: {
          name: null,
          remark: null,
          roleIds: []
        },
        //修改用户组的参数
        updateParam: {
          id: null,
          name: null,
          remark: null,
          roleIds: []
        },
        //添加和修改用户组的校验
        rules: {
          add: {
            name: [
              {required: true, message: '用户组名称不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            roleIds: [
              {required: true, message: '角色不能为空', trigger: 'blur'},
            ]
          },
          update: {
            name: [
              {required: true, message: '用户组名称不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            roleIds: [
              {required: true, message: '角色不能为空', trigger: 'blur'},
            ]
          }
        }
      }
    },
    created() {
      this.loadData();
      this.loadPerm();
      this.loadRole();
    },
    methods: {
      /**
       * 加载表单数据
       */
      loadData() {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + '/sys/group/list', {
          params: this.searchParam,
          withCredentials: true
        }).then(res => {
          this.total = res.data.total;
          this.groupData = res.data.data;
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
       * 加载角色
       */
      loadRole() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/role/all', {
          withCredentials: true
        }).then(res => {
          let data = res.data;
          this.roleData = data.data;
        }).catch(err => {
          this.$message.error(err.response.data.msg)
        })
      },
      /**
       * 加载权限
       */
      loadPerm() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/res/getPerms', {
          withCredentials: true
        }).then(res => {
          let perms = res.data.data;
          perms.forEach(perm => {
            if (perm == 'sys:group:add') {
              this.perm.add = true;
            } else if (perm == 'sys:group:update') {
              this.perm.update = true;
            } else if (perm == 'sys:group:delete') {
              this.perm.delete = true;
            }
          })
        })
      },
      /**
       * 显示用户组添加，修改页面
       * @param row
       */
      visibleEditForm(row) {
        if (row.id) {
          //显示编辑页面
          this.dialogForm.update = true;
          this.updateParam.id = row.id;
          this.updateParam.name = row.name;
          this.updateParam.remark = row.remark;
          let roleIds = [];
          if (row.roles) {
            row.roles.forEach(role => {
              roleIds.push(role.id);
            })
          }
          this.updateParam.roleIds = roleIds;
        } else {
          //显示添加页面
          this.dialogForm.add = true;
        }
      },
      /**
       * 取消添加或者修改页面
       * @param type
       */
      closeEditFrom(type) {
        if (type) {
          this.dialogForm.add = false;
          this.$refs['addParam'].resetFields();
        } else {
          this.dialogForm.update = false;
        }
      },
      /**
       * 添加用户组
       * @param addParam
       */
      addGroup() {
        this.$refs['addParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.addParam);
          this.$axios.post(this.GLOBAL.baseurl + '/sys/group/add', this.addParam, {
            withCredentials: true
          }).then(res => {
            this.dialogForm.add = false;
            this.$message.success(res.data.msg);
            this.loadData();
          }).catch(e => {
            this.$message.error(e.response.data.msg);
          })
        })
      },
      /**
       * 修改用户组
       * @param updateParam
       */
      updateGroup(updateParam) {
        this.$refs['updateParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.updateParam);
          this.$axios.put(this.GLOBAL.baseurl + '/sys/group/update', this.updateParam, {
            withCredentials: true
          }).then(res => {
            this.dialogForm.update = false;
            this.$message.success(res.data.msg);
            this.loadData();
          }).catch(e => {
            this.$message.error(e.response.data.msg);
          })
        })
      },
      /**
       * 删除用户组
       * @param id
       */
      deleteGroup(id) {
        this.$confirm('确定要删除吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.delete(this.GLOBAL.baseurl + '/sys/group/delete', {
            params: {id: id},
            withCredentials: true
          }).then(res => {
            this.$message.success(res.data.msg);
            this.loadData();
          }).catch(e => {
            this.$message.error(e.response.data.msg);
          })
        }).catch(() => {
          this.$message.info("取消删除");
        })
      },
      /**
       * 格式化角色的显示
       * @param row
       * @param column
       * @param cellValue
       * @param index
       * @returns {string}
       */
      roleFormatter(row, column, cellValue, index) {
        if (!cellValue) {
          return;
        }
        let roleNames = '';
        cellValue.forEach(role => {
          roleNames += role.name + ',';
        })
        return roleNames.substr(0, roleNames.length - 1);
      },
    }
  }
</script>

<style scoped>
  .search {
    padding-top: 20px;
    text-align: left;
  }

  .dialogStyle {
    text-align: left;
  }
</style>
