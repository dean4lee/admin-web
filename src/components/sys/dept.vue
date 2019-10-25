<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>部门</el-breadcrumb-item>
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
    <el-table :data="deptData" border highlight-current-row v-loading="loading" element-loading-text="拼命加载中"
              style="width: 100%" row-key="id" :tree-props="{children: 'children'}">
      <el-table-column prop="name" label="名称" min-width="100" align="center"/>
      <el-table-column prop="seq" label="排序" min-width="100" align="center"/>
      <el-table-column prop="remark" label="备注" min-width="100" align="center" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button size="mini" v-if="perm.update" @click="visibleEditForm(scope.row)">编辑</el-button>
          <el-button size="mini" v-if="perm.delete" type="danger" @click="deleteDept(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增 -->
    <el-dialog title="添加" :visible.sync="dialogForm.add" width="30%" @close="closeEditFrom(true)" class="dialogStyle">
      <el-form label-width="80px" ref="addParam" :model="addParam" :rules="rules.add">
        <el-form-item label="父级部门" prop="parentIds">
          <el-cascader
            v-model="addParam.parentIds"
            :options="deptData"
            :props="defaultProps"
            :show-all-levels="false"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="addParam.name"/>
        </el-form-item>
        <el-form-item label="排序" prop="seq">
          <el-input size="small" v-model="addParam.seq"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="addParam.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(true)">取 消</el-button>
        <el-button type="primary" @click="addDept()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改 -->
    <el-dialog title="修改" :visible.sync="dialogForm.update" width="30%" class="dialogStyle"
               @close="closeEditFrom(false)">
      <el-form label-width="80px" ref="updateParam" :model="updateParam" :rules="rules.update">
        <el-form-item label="父级部门" prop="parentIds">
          <el-cascader
            v-model="updateParam.parentIds"
            :options="deptData"
            :props="defaultProps"
            :show-all-levels="false"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="updateParam.name"/>
        </el-form-item>
        <el-form-item label="排序" prop="seq">
          <el-input size="small" v-model="updateParam.seq"/>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input size="small" v-model="updateParam.remark"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(false)">取 消</el-button>
        <el-button type="primary" @click="updateDept()">确 定</el-button>
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
          keyword: null
        },
        //操作按钮显示和英藏
        perm: {
          add: false,
          update: false,
          delete: false
        },
        //表单数据
        deptData: [],
        //父级部门树字段对应配置
        defaultProps: {
          checkStrictly: true,
          children: 'children',
          label: 'name',
          value: 'id',
        },
        loading: false,
        //添加修改页面显示
        dialogForm: {
          add: false,
          update: false
        },
        //添加参数
        addParam: {
          name: null,
          seq: null,
          parentIds: null,
          parentId: null,
          remark: null
        },
        //修改参数
        updateParam: {
          id: null,
          name: null,
          seq: null,
          parentId: null,
          parentIds: [],
          remark: null
        },
        //添加和修改用户的校验
        rules: {
          add: {
            name: [
              {required: true, message: '角色名不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            parentIds: [
              {required: true, message: '父级部门不能为空', trigger: 'blur'},
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ]
          },
          update: {
            name: [
              {required: true, message: '角色名不能为空', trigger: 'blur'},
              {min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur'}
            ],
            parentIds: [
              {required: true, message: '父级部门不能为空', trigger: 'blur'},
            ],
            remark: [
              {min: 1, max: 500, message: '长度在 1 到 500 个字符', trigger: 'blur'}
            ]
          }
        }
      }
    },
    created() {
      this.loadData();
      this.loadPerm();
    },
    methods: {
      /**
       * 加载表单数据
       */
      loadData: function (compareFn) {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + '/sys/dept/list', {
          params: this.searchParam,
          withCredentials: true
        }).then(res => {
          let data = res.data.data;
          let parentData = [];
          data.forEach(dept => {
            if (dept.pid == 0) {
              parentData.push(dept);
            }
          });
          if(!parentData){
            parentData = data;
          }else {
            parentData.forEach(parentDept => {
              this.tree(parentDept, data);
            });
            parentData.sort((a, b) => a.seq - b.seq);
          }
          this.deptData = parentData;
          this.loading = false;
        }).catch(e => {
          this.$message.error(e.response.data.msg);
          this.loading = false;
        })
      },
      /**
       *  递归加载树结构
       */
      tree(parentDept, data){
        parentDept.children = [];
        data.forEach(dept => {
          if(dept.pid == parentDept.id){
            parentDept.children.push(dept);
            this.tree(dept, data);
          }
        });
        parentDept.children.sort((a, b) => a.seq - b.seq);
      },
      /**
       * 搜索查询
       */
      searchData() {
        this.loadData();
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
            if (perm == 'sys:dept:add') {
              this.perm.add = true;
            } else if (perm == 'sys:dept:update') {
              this.perm.update = true;
            } else if (perm == 'sys:dept:delete') {
              this.perm.delete = true;
            }
          })
        })
      },
      /**
       * 显示添加，修改页面
       * @param row
       */
      visibleEditForm(row) {
        if (row.id) {
          //显示编辑页面
          this.dialogForm.update = true;
          this.updateParam.id = row.id;
          this.updateParam.name = row.name;
          this.updateParam.seq = row.seq;
          this.updateParam.parentIds = row.parentId;
          this.updateParam.remark = row.remark;
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
       * 添加
       * @param addParam
       */
      addDept() {
        this.$refs['addParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.addParam.parentId = this.addParam.parentIds[this.addParam.parentIds.length-1];
          this.GLOBAL.formatObj(this.addParam);
          this.$axios.post(this.GLOBAL.baseurl + '/sys/dept/add', this.addParam, {
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
       * 修改
       * @param updateParam
       */
      updateDept(updateParam) {
        this.$refs['updateParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          let parentId = this.updateParam.parentIds[this.updateParam.parentIds.length-1];
          this.updateParam.parentId = parentId ? parentId : this.updateParam.parentIds;
          if (!this.updateParam.parentId) {
            this.updateParam.parentId = 0;
          }
          if (!this.updateParam.seq) {
            this.updateParam.seq = 0
          }
          this.$axios.put(this.GLOBAL.baseurl + '/sys/dept/update', this.updateParam, {
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
       * 删除
       * @param id
       */
      deleteDept(id) {
        this.$confirm('确定要删除吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.delete(this.GLOBAL.baseurl + '/sys/dept/delete', {
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
