<template>
  <div>
    <div>系统未激活，请复制您的邀请码联系客服激活。</div>
    <h1>{{ machineId }} <el-button type="text" @click="copy" size="large">复制</el-button></h1>
  </div>
</template>

<script>
import useClipboard from 'vue-clipboard3'
export default {
  data() {
    return {
      machineId: ''
    }
  },
  mounted() {
    this.getMachineId()
  },
  methods: {
    copy() {
      const { toClipboard } = useClipboard()
      toClipboard(this.machineId).then(() => {
        this.$message({
          message: '复制成功',
          type: 'success'
        })
      })
    },
    async getMachineId() {
      this.machineId = window.electronAPI.getMachineId()
    }
  }
}
</script>
