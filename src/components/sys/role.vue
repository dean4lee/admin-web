<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <el-form inline :model="searchParam" size="small" class="search">
      <el-form-item label="搜索：">
        <el-input v-model="searchParam.keyword" placeholder="名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchData">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="perm.add" @click="visibleEditForm">添加</el-button>
      </el-form-item>
    </el-form>
    <!-- 表单 -->
    <el-table :data="roleData" border highlight-current-row v-loading="loading" element-loading-text="拼命加载中"
              style="width: 100%">
      <el-table-column type="index" width="50" align="center"/>
      <el-table-column prop="name" label="名称" min-width="100" align="center"/>
      <el-table-column prop="roleChar" label="角色字符" min-width="100" align="center"/>
      <el-table-column prop="remark" label="备注" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" @click="visibleResForm(scope.row)">资源</el-button>
          <el-button size="mini" v-if="perm.update" @click="visibleEditForm(scope.row)">编辑</el-button>
          <el-button size="mini" v-if="perm.delete" type="danger" @click="deleteRole(scope.row.id)">删除</el-button>
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
    <!-- 角色新增 -->
    <el-dialog title="添加" :visible.sync="dialogForm.add" width="30%" @close="closeEditFrom(true)" class="dialogStyle">
      <el-form label-width="80px" ref="addParam" :model="addParam" :rules="rules.add">
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="addParam.name"/>
        </el-form-item>
        <el-form-item label="角色字符" prop="roleChar">
          <el-input size="small" v-model="addParam.roleChar"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="addParam.remark"/>
        </el-form-item>
        <el-form-item label="资源" prop="resIds">
          <el-tree
            ref="addTree"
            :data="resData"
            show-checkbox
            node-key="id"
            :props="defaultProps">
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(true)">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 角色修改 -->
    <el-dialog title="修改" :visible.sync="dialogForm.update" width="30%" class="dialogStyle"
               @close="closeEditFrom(false)">
      <el-form label-width="80px" ref="updateParam" :model="updateParam" :rules="rules.update">
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="updateParam.name"/>
        </el-form-item>
        <el-form-item label="角色字符" prop="roleChar">
          <el-input size="small" v-model="updateParam.roleChar"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="updateParam.remark"/>
        </el-form-item>
        <el-form-item label="资源" prop="resIds">
          <el-tree
            ref="updateTree"
            :data="resData"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedResIds"
            :props="defaultProps">
          </el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(false)">取 消</el-button>
        <el-button type="primary" @click="updateRole()">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="资源" :visible.sync="dialogForm.resTree" width="30%" class="dialogStyle" @close="closeRes">
      <el-tree
        ref="showTree"
        :data="resData"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedResIds"
        :props="defaultProps">
      </el-tree>
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
        },
        //操作按钮显示和英藏
        perm: {
          add: false,
          update: false,
          delete: false
        },
        //表单数据
        roleData: [],
        //资源数据
        resData: [],
        //修改页面默认选中的节点
        checkedResIds: [],
        //数据总条数
        total: 0,
        //权限树字段对应配置
        defaultProps: {
          children: 'children',
          label: 'name',
          disabled: true,
        },
        loading: false,
        //添加修改页面显示
        dialogForm: {
          add: false,
          update: false,
          resTree: false
        },
        //添加角色的参数
        addParam: {
          name: null,
          roleChar: null,
          remark: null,
          resIds: []
        },
        //修改角色的参数
        updateParam: {
          id: null,
          name: null,
          roleChar: null,
          remark: null,
          resIds: []
        },
        //添加和修改用户的校验
        rules: {
          add: {
            name: [
              {required: true, message: '角色名不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            roleChar: [
              {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            resIds: [
              {required: true, message: '资源不能为空', trigger: 'blur'},
            ]
          },
          update: {
            name: [
              {required: true, message: '角色名不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            roleChar: [
              {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ],
            resIds: [
              {required: true, message: '资源不能为空', trigger: 'blur'},
            ]
          }
        }
      }
    },
    created() {
      this.loadData();
      this.loadPerm();
      this.loadRes();
    },
    methods: {
      /**
       * 加载表单数据
       */
      loadData() {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + '/sys/role/list', {
          params: this.searchParam,
          withCredentials: true
        }).then(res => {
          this.total = res.data.total;
          this.roleData = res.data.data;
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
       * 加载资源
       */
      loadRes() {
        this.$axios.get(this.GLOBAL.baseurl + '/sys/res/list', {
          withCredentials: true
        }).then(res => {
          let data = res.data;
          this.resData = data.data;
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
            if (perm == 'sys:role:add') {
              this.perm.add = true;
            } else if (perm == 'sys:role:update') {
              this.perm.update = true;
            } else if (perm == 'sys:role:delete') {
              this.perm.delete = true;
            }
          })
        })
      },
      /**
       * 显示角色添加，修改页面
       * @param row
       */
      visibleEditForm(row) {
        if (row.id) {
          //显示编辑页面
          this.dialogForm.update = true;
          this.updateParam.id = row.id;
          this.updateParam.name = row.name;
          this.updateParam.roleChar = row.roleChar;
          this.updateParam.remark = row.remark;
          this.checkedResIds = this.recursionChildrenNode(this.resData, row.resIds);
        } else {
          //显示添加页面
          this.dialogForm.add = true;
        }
      },
      /**
       * 关闭关联资源的对话框时清楚选中的节点
       */
      closeRes() {
        this.$refs.showTree.setCheckedKeys([]);
      },
      /**
       * 显示关联资源的对话框
       */
      visibleResForm(row) {
        this.checkedResIds = this.recursionChildrenNode(this.resData, row.resIds);
        this.dialogForm.resTree = true;
      },
      /**
       * 取消添加或者修改页面
       * @param type
       */
      closeEditFrom(type) {
        if (type) {
          this.dialogForm.add = false;
          this.$refs['addParam'].resetFields();
          this.$refs['addTree'].setCheckedKeys([]);
        } else {
          this.dialogForm.update = false;
          this.$refs['updateTree'].setCheckedKeys([]);
        }
      },
      /**
       * 添加角色
       * @param addParam
       */
      addRole() {
        //获取选中和半选中的节点
        let arrChildren = this.$refs['addTree'].getCheckedKeys();
        let arrParent = this.$refs['addTree'].getHalfCheckedKeys();
        let resIds = arrChildren.concat(arrParent);
        this.addParam.resIds = resIds;

        this.$refs['addParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.addParam);
          this.$axios.post(this.GLOBAL.baseurl + '/sys/role/add', this.addParam, {
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
       * 修改角色
       * @param updateParam
       */
      updateRole(updateParam) {
        let arrChildren = this.$refs['updateTree'].getCheckedKeys();
        let arrParent = this.$refs['updateTree'].getHalfCheckedKeys();
        this.updateParam.resIds = arrChildren.concat(arrParent);

        this.$refs['updateParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.updateParam);
          this.$axios.put(this.GLOBAL.baseurl + '/sys/role/update', this.updateParam, {
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
       * 删除角色
       * @param id
       */
      deleteRole(id) {
        this.$confirm('确定要删除吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.delete(this.GLOBAL.baseurl + '/sys/role/delete', {
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
       * 递归加载选中的资源子节点
       * @param resData
       * @param resIds
       */
      recursionChildrenNode(resData, resIds) {
        let arr = [];
        for (let i of resData) {
          if (i.children) {
            let childArr = this.recursionChildrenNode(i.children, resIds);
            arr = arr.concat(childArr);
          } else {
            for (let j of resIds) {
              if (j == i.id)
                arr.push(i.id);
            }
          }
        }
        return arr;
      }
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
