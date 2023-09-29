<template>
  <div class="main-body-div">
    <div class="title">Let's search for your business on Taab-Supplier.</div>
    <div class="desc">
      If your business does not have an existing Taab-Supplier account, we can register your
      business manually.
    </div>
    <el-input
      :prefix-icon="Search"
      ref="sendInput"
      class="msg-input"
      placeholder="Search your business..."
      v-model="searchWord"
    >
    </el-input>
    <div class="button-div">
      <el-button
        v-loading.body="searching"
        size="large"
        @click="searchBusiness"
        class="search-button"
        round
        type="primary"
        >Search</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import orgAPI from '@/api/org'
import { useBusinessStore } from '@/stores/business'
import { useRouter } from 'vue-router'

const searching = ref(false)
const router = useRouter()
const searchWord = ref('')
const businessStore = useBusinessStore()

async function searchBusiness() {
  try {
    searching.value = true
    let result = await orgAPI.getSupplier(searchWord.value)
    searching.value = false
    businessStore.businessList = result.data.pkg.results
    router.push('/businessresults')
  } catch (error) {
    searching.value = false
    console.log(error)
  }
}
</script>

<style scoped>
.main-body-div {
  width: 100%;
  max-width: 800px;
  min-height: calc(100vh - 40px);
  margin: 0 auto;
  padding: 0 50px;
  font-size: 14px;
}

.main-body-div .title {
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 41px;
  text-align: center;
  color: #363430;
  padding-top: 32px;
}

.main-body-div .desc {
  margin-top: 30px;
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #363430;
}

.msg-input {
  font-size: 18px;
  height: 45px;
  --el-border-radius-base: 15px;
  margin: 70px 0px 50px 0px;
}

.search-button {
  font-size: 18px;
  width: 300px;
}

.button-div {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
