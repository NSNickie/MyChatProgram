<template>
  <div class="center-column">
    <h1 style="font-size: 70px; text-align: center">CUSTOMERS</h1>
    <h2>The quieter you become, the more you are able to hear</h2>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import orgAPI from '@/api/org'
import { ElMessage } from 'element-plus'

onMounted(() => {
  getCustomersList()
})

async function getCustomersList() {
  try {
    let result = await orgAPI.getSupplier()
    console.log(result)
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error,
      type: 'error'
    })
  }
}
</script>
