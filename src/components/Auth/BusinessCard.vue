<template>
  <el-card v-loading="joinLoading" @click="chooseBusiness" class="box-card">
    <template #header>
      <div class="card-header">
        <span class="title">{{ businessName }}</span>
      </div>
    </template>
    <div class="info-title">Address:</div>
    <div class="info">{{ businessAddress }}</div>
    <div class="info-title">Zipcode:</div>
    <div class="info">{{ zipCode }}</div>
    <div class="info-title">Created at:</div>
    <div class="info">{{ dayjs(createdAt).format('YYYY-MM-DD') }}</div>
  </el-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBusinessStore } from '@/stores/business'
import { useUserStore } from '@/stores/user'
import { useCatalogStore } from '@/stores/catalog'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import orgAPI from '@/api/org'
import catalogAPI from '@/api/catalog'

const router = useRouter()
const catalogStore = useCatalogStore()
const userStore = useUserStore()
const joinLoading = ref(false)
const businessStore = useBusinessStore()
const props = defineProps(['index'])
const businessName = computed(() => {
  return businessStore.businessList[props.index].businessName
})
const businessAddress = computed(() => {
  return businessStore.businessList[props.index].businessAddress
})
const zipCode = computed(() => {
  return businessStore.businessList[props.index].zipcode
})
const createdAt = computed(() => {
  return businessStore.businessList[props.index].createdAt
})

async function chooseBusiness() {
  try {
    await ElMessageBox.confirm(`Do you want to join ${businessName.value}?`, 'Join', {
      confirmButtonText: 'Yes, I do',
      cancelButtonText: 'No',
      type: 'info'
    })
  } catch (error) {
    return
  }
  try {
    businessStore.joinLoading = true
    let result = await orgAPI.bindSupplier(businessStore.businessList[props.index].supplierUid)
    ElMessage({
      message: result.data.pkg.msg,
      type: 'success'
    })
    userStore.supplierUid = result.data.pkg.supplierUid

    userStore.businessName = businessName.value
    userStore.supplierAvatarUrl = businessStore.businessList[props.index].avatar
    let catalogResult = await catalogAPI.getCatalogs(userStore.supplierUid)
    catalogStore.catalogUid = catalogResult.data.pkg.catalogs[0].uid
    await getMasterCatalog()
    businessStore.joinLoading = false
    router.push('/home')
    console.log(result)
  } catch (error) {
    businessStore.joinLoading = false
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'join failed',
      type: 'error'
    })
    switch (error.response.data.pkg.errorType) {
      case 'ALREADY_HAVE_SUPPLIER':
        router.push('/home')
        break
      default:
        console.log(error)
    }
    console.log(error)
  }
}

async function getMasterCatalog() {
  let result = await catalogAPI.getMasterCategory()
  console.log(result)
  let data = result.data
  if (data.apiStatus !== 'ok') {
    throw new Error()
  }
  ElMessage({
    message: 'Get master category successfully',
    type: 'success'
  })
  catalogStore.masterCategory = data.pkg.result
  catalogStore.masterCategoryHashTable = catalogStore.masterCategoryHash
  catalogStore.masterCategoryOptions = catalogStore.masterCascaderCategoryOptions
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card:hover {
  background-color: var(--el-color-primary-light-8);
  cursor: pointer;
}
.box-card {
  min-width: 300px;
  width: 320px;
  height: 270px;
  margin: 15px;
  border-radius: 15px;
  display: inline-block;
}

.info {
  word-wrap: break-word;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-title {
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: 600;
}

.title {
  font-size: 16px;
  font-weight: bolder;
}
</style>
