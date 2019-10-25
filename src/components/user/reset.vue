<template>
  <el-row>
    <el-col :span="8" style="min-height: 10px"></el-col>
    <el-col :span="5">
      <el-form label-width="100px" ref="user" :model="user" :rules="rules" style="text-align: left">
        <el-form-item label="新密码" prop="password">
          <el-input size="text" type="password" v-model="user.password"/>
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input size="text" type="password" v-model="user.password2"/>
        </el-form-item>
        <el-row>
          <el-col :span="16">
            <el-form-item label="验证码" prop="code">
              <el-input type="text" v-model="user.code" placeholder="验证码"/>
            </el-form-item>
          </el-col>
          <el-col :span="8" class="code-box">
            <el-button type="primary" @click="getCode" style="margin-left: 5px" :disabled="codeBtn">{{codeMsg}}
            </el-button>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="update" style="width: 200px">确定</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="11"></el-col>
  </el-row>
</template>

<script>
  export default {
    data() {
      var validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.user.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        codeMsg: '获取验证码',
        codeBtn: false,
        user: {
          password: null,
          password2: null,
          code: null
        },
        rules: {
          password: [
            {required: true, message: '请填写新密码', trigger: 'blur'},
            {min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur'}
          ],
          password2: [
            {required: true, message: '请填写新密码', trigger: 'blur'},
            {validator: validatePass2, trigger: 'blur'}
            ],
          code: [
            {required: true, message: '请填写验证码', trigger: 'blur'},
          ]
        }
      }
    },
    created() {

    },
    methods: {
      update() {
        this.$refs['user'].validate((valid) => {
          if (!valid) {
            return;
          }
          this.$axios.put(this.GLOBAL.baseurl + '/sys/user/resetPwd', this.user, {
            withCredentials: true
          }).then(res => {
            this.$message.success(res.data.msg)
            window.location.reload();
          }).catch(e => {
            this.$message.error(e.response.data.msg)
          })
        })
      },
      /**
       * 获取邮箱验证码
       */
      getCode() {
        this.$axios.get(this.GLOBAL.baseurl + '/email/code', {
          withCredentials: true
        }).then(res => {
        }).catch(e => {
          this.$message.error("获取验证码失败")
        });
        //按钮显示文本
        this.codeBtn = true;
        let i = 60;
        let interval = setInterval(() => {
          this.codeMsg = i + "s后重新获取验证码";
          if (i == 0) {
            this.codeBtn = false;
            this.codeMsg = "重新获取验证码";
            clearInterval(interval);
          }
          i--;
        }, 1000);
      }
    }
  }
</script>

<style scoped>

</style>
