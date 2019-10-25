<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>资源</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="padding-top: 20px; text-align: left">
      <el-button type="primary" size="mini" v-if="perm.add" @click="visibleEditForm">添加</el-button>
    </div>
    <el-row style="padding-top: 20px;">
      <el-col :span="12" class="custom-tree-container">
        <el-tree
          v-loading="loading"
          element-loading-text="拼命加载中"
          :data="resData"
          node-key="id"
          :props="defaultProps">
      <span class="custom-tree-node" slot-scope="{ node, data }" @click="showDetail(data)">
        <span>{{ node.label }}</span>
        <span>
          <el-button type="text" size="mini" v-if="perm.update" @click.stop="visibleEditForm(data)">
            修改
          </el-button>
          <el-button type="text" size="mini" v-if="perm.delete" @click.stop="deleteRes(data)">
            删除
          </el-button>
        </span>
      </span>
        </el-tree>
      </el-col>
      <el-col :span="12">
        <!-- 显示资源的详细信息 -->
        <el-form label-width="80px" disabled :model="infoParam" class="dialogStyle">
          <el-form-item label="名称">
            <el-input size="small" v-model="infoParam.name"/>
          </el-form-item>
          <el-form-item label="类型">
            <el-radio v-model="infoParam.type" label="1">菜单</el-radio>
            <el-radio v-model="infoParam.type" label="2">权限</el-radio>
          </el-form-item>
          <el-form-item label="url">
            <el-input size="small" v-model="infoParam.url"/>
          </el-form-item>
          <el-form-item label="权限字符">
            <el-input size="small" v-model="infoParam.permChar"/>
          </el-form-item>
          <el-form-item label="图标">
            <el-input size="small" v-model="infoParam.icon"/>
          </el-form-item>
          <el-form-item label="排序">
            <el-input size="small" v-model="infoParam.seq"/>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- 资源添加 -->
    <el-dialog title="添加" :visible.sync="dialogForm.add" width="30%" @close="closeEditFrom(true)" class="dialogStyle">
      <el-form label-width="80px" ref="addParam" :model="addParam" :rules="rules.add">
        <el-form-item label="父级菜单" prop="parentId">
          <el-select size="small" v-model="addParam.parentId" placeholder="不选择默认是顶级菜单" clearable>
            <el-option v-for="menu in menuList" :key="menu.id" :label="menu.name" :value="menu.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="addParam.name"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio v-model="addParam.type" label="1">菜单</el-radio>
          <el-radio v-model="addParam.type" label="2">权限</el-radio>
        </el-form-item>
        <el-form-item label="url" prop="url">
          <el-input size="small" v-model="addParam.url"/>
        </el-form-item>
        <el-form-item label="权限字符" prop="permChar">
          <el-input size="small" v-model="addParam.permChar"/>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input size="small" v-model="addParam.icon"/>
        </el-form-item>
        <el-form-item label="排序" prop="seq">
          <el-input size="small" v-model="addParam.seq"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(true)">取 消</el-button>
        <el-button type="primary" @click="addRes()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 资源修改 -->
    <el-dialog title="修改" :visible.sync="dialogForm.update" width="30%" @close="closeEditFrom(false)"
               class="dialogStyle">
      <el-form label-width="80px" ref="updateParam" :model="updateParam" :rules="rules.update">
        <el-form-item label="父级菜单" prop="parentId">
          <el-select size="small" v-cloak v-model="updateParam.parentId" placeholder="不选择默认是顶级菜单" clearable>
            <el-option v-for="menu in menuList" :key="menu.id" :label="menu.name" :value="menu.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input size="small" v-model="updateParam.name"/>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio v-model="updateParam.type" disabled label="1">菜单</el-radio>
          <el-radio v-model="updateParam.type" disabled label="2">权限</el-radio>
        </el-form-item>
        <el-form-item label="url" prop="url">
          <el-input size="small" v-model="updateParam.url"/>
        </el-form-item>
        <el-form-item label="权限字符" prop="permChar">
          <el-input size="small" v-model="updateParam.permChar"/>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input size="small" v-model="updateParam.icon"/>
        </el-form-item>
        <el-form-item label="排序" prop="seq">
          <el-input size="small" v-model="updateParam.seq"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeEditFrom(false)">取 消</el-button>
        <el-button type="primary" @click="updateRes()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        //资源数据
        resData: [],
        //加载动画
        loading: false,
        //菜单列表，添加资源时选择父级菜单使用
        menuList: [],
        //权限树字段对应配置
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        //按钮权限
        perm: {
          add: false,
          update: false,
          delete: false
        },
        //添加参数
        addParam: {
          name: null,
          type: null,
          url: null,
          parentId: null,
          permChar: null,
          icon: null,
          seq: null
        },
        //修改参数
        updateParam: {
          id: null,
          name: null,
          type: null,
          url: null,
          parentId: null,
          permChar: null,
          icon: null,
          seq: null
        },
        //详细信息参数
        infoParam: {
          id: null,
          name: null,
          type: null,
          url: null,
          parentId: null,
          permChar: null,
          icon: null,
          seq: null
        },
        //显示添加，修改页面
        dialogForm: {
          add: false,
          update: false,
        },
        rules: {
          add: {
            name: [
              {required: true, message: '资源名称不能为空', trigger: 'blur'},
            ],
            type: [
              {required: true, message: '资源类型不能为空', trigger: 'blur'},
            ],
          },
          update: {
            name: [
              {required: true, message: '资源名称不能为空', trigger: 'blur'},
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
       * 加载数据
       */
      loadData() {
        this.GLOBAL.formatObj(this.searchParam);
        this.loading = true;
        this.$axios.get(this.GLOBAL.baseurl + "/sys/res/list", {
          withCredentials: true
        }).then(res => {
          let data = res.data.data;
          //递归加载目录树
          let parentRes = [];
          data.forEach(res => {
            if(res.pid == 0){
              parentRes.push(res);
            }
          });
          parentRes.sort((a, b) => a.seq - b.seq);
          this.resData = this.tree(parentRes, data);
          this.loading = false;
        }).catch(err => {
          this.loading = false
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
            if (perm == 'sys:res:add') {
              this.perm.add = true;
            } else if (perm == 'sys:res:update') {
              this.perm.update = true;
            } else if (perm == 'sys:res:delete') {
              this.perm.delete = true;
            }
          })
        })
      },
      /**
       * 加载菜单列表
       */
      loadMenuList() {
        this.$axios.get(this.GLOBAL.baseurl + "/sys/res/menuList", {
          withCredentials: true
        }).then(res => {
          this.menuList = res.data.data;
        }).catch(err => {
          this.$message.error(err.response.data.msg)
        })
      },
      /**
       * 点击时将详细信息赋值到updateParam
       * @param data
       */
      showDetail(data) {
        if (data.type == '1') {
          data.type = '1';
        } else if (data.type == '2') {
          data.type = '2'
        }
        if (data.parentId == 0) {
          data.parentId = null;
        }
        this.infoParam = data;
      },
      /**
       * 打开添加或者修改的页面
       * @param data
       */
      visibleEditForm(data) {
        this.loadMenuList();
        if (data.id) {
          if (data.type == '1') {
            data.type = '1';
          } else if (data.type == '2') {
            data.type = '2'
          }
          if (data.parentId == 0) {
            data.parentId = null;
          }
          this.updateParam.id = data.id;
          this.updateParam.name = data.name;
          this.updateParam.type = data.type;
          this.updateParam.url = data.url;
          this.updateParam.parentId = data.parentId;
          this.updateParam.permChar = data.permChar;
          this.updateParam.icon = data.icon;
          this.updateParam.seq = data.seq;

          this.dialogForm.update = true;
        } else {
          this.dialogForm.add = true;
        }
      },
      /**
       * 关闭添加或者修改页面
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
       * 添加资源
       */
      addRes() {
        this.$refs['addParam'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.addParam);
          this.$axios.post(this.GLOBAL.baseurl + '/sys/res/add', this.addParam, {
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
       * 修改资源
       */
      updateRes() {
        if (!this.updateParam.parentId) {
          this.updateParam.parentId = 0;
        }
        if (!this.updateParam.seq) {
          this.updateParam.seq = 0
        }
        this.$axios.put(this.GLOBAL.baseurl + '/sys/res/update', this.updateParam, {
          withCredentials: true
        }).then(res => {
          this.dialogForm.update = false;
          this.$message.success(res.data.msg);
          this.loadData();
        }).catch(e => {
          this.$message.error(e.response.data.msg);
        })
      },
      /**
       * 删除资源
       * @param data
       */
      deleteRes(data) {
        this.$confirm('确定要删除吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$axios.delete(this.GLOBAL.baseurl + '/sys/res/delete', {
            params: {id: data.id},
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
       * 递归加载目录树
       */
      tree(parentRes, data){
        parentRes.forEach(parent => {
          parent.children = [];
          data.forEach(res => {
            if(parent.id == res.pid){
              parent.children.push(res);
            }
          });
          if(parent.children) {
            parent.children.sort((a, b) => a.seq - b.seq);
            this.tree(parent.children, data);
          }
        });
        return parentRes;
      }
    }
  }
</script>

<style scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }

  .dialogStyle {
    text-align: left;
  }
</style>
