<template>
  <div class="not-found-container">
    <h1>404 - 页面未找到</h1>
    <p>您正在寻找的页面不存在。</p>
    <router-link :to="{ name: 'Dashboard' }">返回仪表盘</router-link>
  </div>
</template>

<script setup>
// NotFound 页面不需要脚本逻辑
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 5rem;
  text-align: center;
}

h1 {
  font-size: 3rem;
  color: #333;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

a {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}
</style>