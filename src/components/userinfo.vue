<template>
  <el-row>
    <el-col :span="8" style="min-height: 10px"></el-col>
    <el-col :span="8">
      <el-form label-width="80px" ref="user" :model="user" :rules="rules" style="text-align: left">
        <el-form-item label="昵称" prop="nickname">
          <el-input size="small" v-model="user.nickname"/>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input size="small" v-model="user.age"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input size="small" v-model="user.email"/>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input size="small" v-model="user.phone"/>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio v-model="user.sex" label="1">男</el-radio>
          <el-radio v-model="user.sex" label="0">女</el-radio>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update">修改</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="8"></el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      return {
        user: {
          nickname: null,
          age: null,
          email: null,
          phone: null,
          password: null,
          sex: null,
        },
        rules: {
          nickname: [
            {min: 1, max: 20, message: '长度在 1 到 12 个字符', trigger: 'blur'}
          ],
          age: [
            {pattern: '^[0-9]{1,2}$', message: '年龄在0 到 99', trigger: 'blur'}
          ],
          email: [
            // {required: true, message: '邮箱不能为空', trigger: 'blur'},
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ],
          phone: [
            // {required: true, message: '手机号不能为空', trigger: 'blur'},
            {pattern: '^[1][3-9][0-9]{9}$', message: '手机号格式不正确', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.init();
    },
    methods: {
      init() {
        this.user = JSON.parse(localStorage.getItem('user'));
        if(!this.user.age) {
          this.user.age = null;
        }
        if (this.user.sex == '0') {
          this.user.sex = '0';
        } else if (this.user.sex == '1') {
          this.user.sex = '1';
        }
      },
      update() {
        this.$refs['user'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.GLOBAL.formatObj(this.user);
          this.$axios.put(this.GLOBAL.baseurl + '/sys/user/updateSelf', this.user, {
            withCredentials: true
          }).then(res => {
            this.user.password = '';
            localStorage.setItem('user', JSON.stringify(this.user));
            this.$message.success(res.data.msg)
          }).catch(e => {
            this.$message.error(e.response.data.msg)
          })
        })
      }
    }
  }
</script>

<style scoped>

</style>
