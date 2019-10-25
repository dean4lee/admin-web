<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统用户</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <el-form inline :model="searchParam" size="small" class="search">
      <el-form-item label="搜索：">
        <el-input v-model="searchParam.keyword" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.status" placeholder="锁定状态" clearable>
          <el-option label="锁定" value=true></el-option>
          <el-option label="正常" value=false></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.deptId" placeholder="部门" clearable>
          <el-option v-for="dept in deptData" :label="dept.name" :value="dept.id" :key="dept.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.roleId" placeholder="角色" clearable>
          <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchParam.groupId" placeholder="用户组" clearable>
          <el-option v-for="group in groupData" :label="group.name" :value="group.id" :key="group.id"/>
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
    <el-table :data="userData" border highlight-current-row v-loading="loading" element-loading-text="拼命加载中"
              style="width: 100%">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="username" label="用户名" min-width="100" align="center"/>
      <el-table-column prop="nickname" label="昵称" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column prop="phone" label="手机号" width="120" align="center"/>
      <el-table-column prop="email" label="邮箱" min-width="120" align="center" :show-overflow-tooltip="true"/>
      <el-table-column prop="sex" label="性别" width="60" align="center" :formatter="sexFormatter"/>
      <el-table-column prop="age" label="年龄" width="60" align="center"/>
      <el-table-column prop="status" label="状态" width="60" align="center" :formatter="statusFormatter"/>
      <el-table-column prop="deptName" label="部门" width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column prop="roles" label="角色" min-width="100" align="center" :formatter="roleFormatter"
                       :show-overflow-tooltip="true"/>
      <el-table-column prop="groups" label="用户组" min-width="100" align="center" :formatter="groupFormatter"
                       :show-overflow-tooltip="true"/>
      <el-table-column prop="remark" label="备注" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" v-if="perm.update" @click="visibleEditForm(scope.row)">编辑</el-button>
          <el-button size="mini" v-if="perm.delete" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
          <el-switch v-if="perm.status"
                     v-model="scope.row.status"
                     inactive-text="锁定"
                     active-color="#ff4949"
                     inactive-color="#13ce66"
                     @change="changeStatus(scope.row)">
          </el-switch>
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
    <!-- 用户新增 -->
    <el-dialog title="添加" :visible.sync="dialogForm.add" width="30%" @close="closeEditFrom(true)" class="dialogStyle">
      <el-form label-width="80px" ref="addParam" :model="addParam" :rules="rules.add">
        <el-form-item label="用户名" prop="username">
          <el-input size="small" v-model="addParam.username"/>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input size="small" v-model="addParam.nickname"/>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input size="small" v-model="addParam.age"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="addParam.email"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input size="small" v-model="addParam.phone"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input size="small" v-model="addParam.remark"/>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio v-model="addParam.sex" label="1">男</el-radio>
          <el-radio v-model="addParam.sex" label="0">女</el-radio>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="addParam.deptId" placeholder="请选择" clearable>
            <el-option v-for="dept in deptData" :label="dept.name" :value="dept.id" :key="dept.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="addParam.roleIds" placeholder="请选择" multiple clearable>
            <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户组" prop="groupIds">
          <el-select v-model="addParam.groupIds" placeholder="请选择" multiple clearable>
            <el-option v-for="group in groupData" :label="group.name" :value="group.id" :key="group.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(true)">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 用户修改 -->
    <el-dialog title="修改" :visible.sync="dialogForm.update" width="30%" class="dialogStyle">
      <el-form label-width="80px" ref="updateParam" :model="updateParam" :rules="rules.update">
        <el-form-item label="昵称">
          <el-input size="small" v-model="updateParam.nickname"/>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input size="small" v-model="updateParam.age"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="updateParam.email"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input size="small" v-model="updateParam.phone"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="updateParam.remark"/>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio v-model="updateParam.sex" label="1">男</el-radio>
          <el-radio v-model="updateParam.sex" label="0">女</el-radio>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="updateParam.deptId" placeholder="请选择" clearable>
            <el-option v-for="dept in deptData" :label="dept.name" :value="dept.id" :key="dept.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="updateParam.roleIds" placeholder="请选择" multiple clearable>
            <el-option v-for="role in roleData" :label="role.name" :value="role.id" :key="role.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="用户组" prop="groupIds">
          <el-select v-model="updateParam.groupIds" placeholder="请选择" multiple clearable>
            <el-option v-for="group in groupData" :label="group.name" :value="group.id" :key="group.id"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(false)">取 消</el-button>
        <el-button type="success" @click="resetpwd(updateParam.id)">重置密码</el-button>
        <el-button type="primary" @click="updateUser()">确 定</el-button>
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
          status: null,
          keyword: null,
          roleId: null,
          deptId: null,
          groupId: null,
          pageSize: 10,
          pageNum: 1,
        },
        //表单数据
        userData: [],
        //部门数据
        deptData: [],
        //角色列表
        roleData: [],
        //用户组列表
        groupData: [],
        total: 0,
        //加载显示和隐藏
        loading: true,
        //操作按钮显示和英藏
        perm: {
          add: false,
          update: false,
          delete: false,
          status: false
        },
        //控制添加，编辑的弹出框显示和隐藏
        dialogForm: {
          add: false,
          update: false
        },
        //添加用户的参数
        addParam: {
          id: null,
          username: null,
          nickname: null,
          phone: null,
          email: null,
          age: null,
          sex: null,
          remark: null,
          deptId: null,
          roleIds: [],
          groupIds: []
        },
        //修改用户的参数
        updateParam: {
          id: null,
          nickname: null,
          phone: null,
          email: null,
          age: null,
          sex: null,
          remark: null,
          deptId: null,
          roleIds: [],
          groupIds: []
        },
        //添加和修改用户的校验
        rules: {
          add: {
            username: [
              {required: true, message: '用户名不能为空', trigger: 'blur'},
              {pattern: '^[a-zA-Z][a-zA-Z0-9]{3,9}$', message: '用户名必须4 到 12位的数字或字母，字母开头', trigger: 'blur'}
            ],
            nickname: [
              {min: 1, max: 20, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            age: [
              {pattern: '^[0-9]{1,2}$', message: '年龄在0 到 99', trigger: 'blur'}
            ],
            email: [
              {required: true, message: '邮箱不能为空', trigger: 'blur'},
              {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
            ],
            phone: [
              // {required: true, message: '手机号不能为空', trigger: 'blur'},
              {pattern: '^[1][3-9][0-9]{9}$', message: '手机号格式不正确', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            deptId: [
              {required: true, message: '所属部门不能为空', trigger: 'blur'},
            ],
          },
          update: {
            nickname: [
              {min: 1, max: 20, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            age: [
              {pattern: '^[0-9]{1,2}$', message: '年龄在0 到 99', trigger: 'blur'}
            ],
            email: [
              {required: true, message: '邮箱不能为空', trigger: 'blur'},
              {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
            ],
            phone: [
              // {required: true, message: '手机号不能为空', trigger: 'blur'},
              {pattern: '^[1][3-9][0-9]{9}$', message: '手机号格式不正确', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            deptId: [
              {required: true, message: '所属部门不能为空', trigger: 'blur'},
            ],
          }
        }
      }
    },
    created() {
      this.loadRoleData();
      this.loadGroupData();
      this.loadDeptData();
      this.loadData();
      this.loadPerm();
    },
    methods: {
      /**
       * 加载数据
       */
      loadData() {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + '/sys/user/list', {
          params: this.searchParam,
          withCredentials: true
        }).then(res => {
          this.total = res.data.total;
          this.userData = res.data.data;
          this.loading = false;
        }).catch(e => {
          this.$message.error(e.response.data.msg);
          this.loading = false;
        })
      },
      /**
       * 加载角色
       */
      loadRoleData() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/role/all', {
          withCredentials: true
        }).then(res => {
          this.roleData = res.data.data;
        }).catch(e => {
          this.$message.error(e.response.data.msg);
        })
      },
      /**
       * 加载用户组
       */
      loadGroupData() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/group/all', {
          withCredentials: true
        }).then(res => {
          this.groupData = res.data.data;
        }).catch(e => {
          this.$message.error(e.response.data.msg);
        })
      },
      /**
       * 加载部门
       */
      loadDeptData() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/dept/list', {
          withCredentials: true
        }).then(res => {
          this.deptData = res.data.data;
      }).catch(e => {
          this.$message.error(e.response.data.msg);
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
            if (perm == 'sys:user:add') {
              this.perm.add = true;
            } else if (perm == 'sys:user:update') {
              this.perm.update = true;
            } else if (perm == 'sys:user:delete') {
              this.perm.delete = true;
            } else if (perm == 'sys:user:status') {
              this.perm.status = true;
            }
          })
        })
      },
      /**
       * 搜索按钮加载数据
       */
      searchData() {
        this.searchParam.pageNum = 1;
        this.loadData();
      },
      /**
       * 显示用户添加，修改页面
       * @param row
       */
      visibleEditForm(row) {
        if (row.id) {
          //显示编辑页面
          this.dialogForm.update = true;
          let roleIds = [];
          let groupIds = [];
          if (row.roles) {
            row.roles.forEach(role => {
              roleIds.push(role.id);
            })
          }
          if (row.groups) {
            row.groups.forEach(group => {
              groupIds.push(group.id);
            })
          }
          this.updateParam.id = row.id;
          this.updateParam.nickname = row.nickname;
          this.updateParam.phone = row.phone;
          this.updateParam.email = row.email;
          this.updateParam.age = row.age;
          this.updateParam.sex = row.sex;
          this.updateParam.remark = row.remark;
          this.updateParam.deptId = row.deptId;
          this.updateParam.roleIds = roleIds;
          this.updateParam.groupIds = groupIds;
          if (row.sex == 1) {
            this.updateParam.sex = '1';
          } else if (row.sex == 0) {
            this.updateParam.sex = '0';
          }
        } else {
          //显示添加页面
          this.dialogForm.add = true;
        }
      },
      /**
       * 取消添加或者修改
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
       * 添加用户
       */
      addUser() {
        this.$refs['addParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          if (!this.addParam.roleIds.length && !this.addParam.groupIds.length) {
            this.$message.error("角色和用户组必须选择");
            return;
          }
          this.GLOBAL.formatObj(this.addParam);
          this.$axios.post(this.GLOBAL.baseurl + '/sys/user/add', this.addParam, {
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
       * 修改用户
       */
      updateUser() {
        this.$refs['updateParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          if (!this.updateParam.roleIds.length && !this.updateParam.groupIds.length) {
            this.$message.error("角色和用户组必须选择");
            return;
          }
          this.GLOBAL.formatObj(this.updateParam);
          this.$axios.put(this.GLOBAL.baseurl + '/sys/user/update', this.updateParam, {
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
       * 删除用户
       * @param id
       */
      deleteUser(id) {
        this.$confirm('确定要删除吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.delete(this.GLOBAL.baseurl + '/sys/user/delete', {
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
       * 修改状态
       * @param row
       */
      changeStatus(row) {
        this.$confirm('确定要修改用户状态吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = new Object();
          data.id = row.id;
          data.status = row.status;
          this.$axios.put(this.GLOBAL.baseurl + '/sys/user/status', data, {
            withCredentials: true
          }).then(res => {
            this.$message.success(res.data.msg);
            this.loadData();
          }).catch(e => {
            row.status = !row.status;
            this.$message.error(e.response.data.msg);
          })
        }).catch(() => {
          row.status = !row.status;
          this.$message.info("取消修改");
        })
      },
      /**
       * 重置密码
       * @param id
       */
      resetpwd(id) {
        this.$confirm('确定要重置用户密码吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.put(this.GLOBAL.baseurl + '/sys/user/randomPwd', null, {
            params: {id: id},
            withCredentials: true
          }).then(res => {
            this.dialogForm.update = false;
            this.$message.success(res.data.msg);
            this.loadData();
          }).catch(e => {
            this.$message.error(e.response.data.msg);
          })
        }).catch(() => {
          this.$message.info("取消修改");
        })
      },
      /**
       * 格式化性别的显示
       * @param row
       * @param column
       * @param cellValue
       * @param index
       * @returns {string}
       */
      sexFormatter(row, column, cellValue, index) {
        if (cellValue == 1) {
          return '男';
        } else if (cellValue == 0) {
          return '女'
        } else {
          return '未知'
        }
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
      /**
       * 格式化用户组的显示
       */
      groupFormatter(row, column, cellValue, index) {
        if (!cellValue) {
          return;
        }
        let groupNames = '';
        cellValue.forEach(group => {
          groupNames += group.name + ',';
        })
        return groupNames.substr(0, groupNames.length - 1);
      },
      /**
       * 格式化状态的显示
       * @param row
       * @param column
       * @param cellValue
       * @param index
       * @returns {string}
       */
      statusFormatter(row, column, cellValue, index) {
        if (cellValue) {
          return '锁定';
        } else {
          return '正常';
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

  .dialogStyle {
    text-align: left;
  }
</style>
