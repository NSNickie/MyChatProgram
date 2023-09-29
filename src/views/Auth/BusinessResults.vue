<template>
  <div v-loading="businessStore.joinLoading" class="main-body-div">
    <div v-if="businessCount !== 0" class="title">
      {{ businessCount }} business(es) found on Taab-Supplier.
    </div>
    <div v-else class="title">No results found.</div>
    <div v-if="businessCount !== 0" class="desc">Review and select your business.</div>
    <div v-else class="desc">
      Sorry, we couldn't find any matches. Let's register your business on Taab-Supplier.
    </div>

    <div class="scroll-div">
      <el-scrollbar :always="false" view-class="scrollbar">
        <div class="card-scrollbar-div" v-if="businessCount !== 0">
          <BusinessCard
            v-for="(business, index) in businessStore.businessList"
            :key="business.supplierUid"
            :index="index"
          />
        </div>
        <div class="register-hint" v-else>
          <el-button
            round
            size="large"
            @click="goToRegisterBusiness"
            type="primary"
            class="register-button"
            >Register</el-button
          >
        </div>
      </el-scrollbar>
    </div>
    <el-button round size="large" @click="backToSearch" class="back-button">Back</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import BusinessCard from '@/components/Auth/BusinessCard.vue'
import { useBusinessStore } from '@/stores/business'

const router = useRouter()
const businessStore = useBusinessStore()
const businessCount = computed(() => {
  return businessStore.businessList.length
})

function backToSearch() {
  router.push('/searchbusiness')
}

function goToRegisterBusiness() {
  router.push('/registerbusiness')
}
</script>

<style scoped>
.main-body-div {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  height: calc(100vh - 40px);
  margin: 0 auto;
  padding: 0 50px;
  font-size: 14px;
}

.register-hint {
  display: flex;
  justify-content: center;
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

.scroll-div {
  margin-top: 30px;
  height: calc(100% - 240px);
  /* background-color: antiquewhite; */
}

.scrollbar {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-scrollbar-div {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.back-button {
  font-size: 18px;
  margin-top: 20px;
  width: 300px;
}

.register-button {
  font-size: 18px;
  margin-top: 20px;
  width: 300px;
}
</style>
