<template>
  <div class="login-wrap">
    <el-form :model="user" :rules="rules" ref="user" class="login-container">
      <h3 class="title">用户登录</h3>
      <el-form-item prop="username">
        <el-input type="text" v-model="user.username" placeholder="账号"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" @keyup.enter.native="login('user')" v-model="user.password" placeholder="密码"></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item prop="code">
            <el-input type="text" v-model="user.code" placeholder="图形验证码"
                      @keyup.enter.native="login('user')"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" class="code-box">
          <img :src="codeimg" @click="getCodeimg()" class="codeimg">
        </el-col>
      </el-row>
      <el-form-item>
        <el-checkbox v-model="user.rememberMe">7天内记住我</el-checkbox>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click="login('user')">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script type="text/ecmascript-6">
  export default {
    name: 'login',
    data() {
      return {
        user: {
          username: '',
          password: '',
          code: '',
          rememberMe: false
        },
        codeimg: '',
        //rules前端验证
        rules: {
          username: [
            {required: true, message: '请输入账号', trigger: 'blur'},
            {min: 4, max: 10, message: '长度在 4 到 12 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
          code: [{required: true, message: '请输入验证码', trigger: 'blur'}]
        }
      }
    },
    created() {
      //加载验证码
      this.getCodeimg();
    },
    methods: {
      login(user) {
        this.$refs[user].validate((valid) => {
          if (!valid) {
            return;
          }
          this.$axios.post(this.GLOBAL.baseurl + "/login", this.user, {
              withCredentials: true
            }
          ).then(res => {
            localStorage.setItem('user', JSON.stringify(res.data.data));
            this.$router.push({path: '/navigation'});
          }).catch(e => {
            this.getCodeimg();
            this.$message.error(e.response.data.msg);
          });
        })
      },
      getCodeimg() {
        this.codeimg = this.GLOBAL.baseurl + '/code?' + Math.random();
      }
    },
  }
</script>

<style scoped>
  .login-wrap {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding-top: 10%;
    background: url(../img/background.svg) no-repeat center right;
    background-size: 100%;
  }

  .login-container {
    border-radius: 10px;
    margin: 0px auto;
    width: 350px;
    padding: 30px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    text-align: left;
    box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
  }

  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }

  .code-box {
    text-align: right;
  }

  .codeimg {
    height: 40px;
  }
</style>
