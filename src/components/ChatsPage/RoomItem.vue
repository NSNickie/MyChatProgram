<template>
  <div>
    <el-menu-item class="menu-item" :index="props.index">
      <div class="room-div">
        <div class="avatar-div">
          <el-badge
            class="avatar-badge"
            :max="20"
            :hidden="isHideBadge"
            :value="unreadMessagesCount"
          >
            <el-avatar
              :size="45"
              src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
            />
          </el-badge>
        </div>
        <div class="info-div">
          <span>{{ props.groupName }}</span>
          <span></span>
        </div>
      </div>
    </el-menu-item>
    <el-divider class="divider"></el-divider>
  </div>
</template>

<script setup>
import { useChatStore } from '../../stores'
import { computed } from 'vue'
const chatStore = useChatStore()
const props = defineProps(['groupName', 'index', 'groupUuid'])
const unreadMessagesCount = computed(() => {
  return chatStore.unreadMessagesCount[props.groupUuid]
})

const isHideBadge = computed(() => {
  if (chatStore.currentGroupUuid === props.groupUuid || unreadMessagesCount.value === 0) {
    return true
  } else {
    return false
  }
})
</script>

<style scoped>
.room-div {
  width: 100%;
  height: 100%;
  display: flex;
}

.avatar-div {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.avatar-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.info-div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.info-div span:nth-child(1) {
  padding-top: 10px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: center;
}

.info-div span:nth-child(2) {
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: center;
  padding-bottom: 15px;
  color: darkgray;
}

.menu-item {
  --el-menu-item-height: 70px;
  border-bottom: 1px;
}

.divider {
  position: absolute;
  margin: 0px;
  width: 77%;
  --el-border-color: #dcdfe642;
  right: 0;
}

:deep(.is-fixed) {
  transform: translateX(85%) translateY(-30%);
  pointer-events: none;
}

.el-badge {
  --el-badge-font-size: 11px;
  --el-badge-padding: 4px;
}
</style>
