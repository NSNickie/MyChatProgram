<template>
  <div v-loading="itemLoading">
    <div class="menu-item" :index="props.index.toString()">
      <div class="room-div">
        <div class="avatar-div">
          <el-avatar
            :size="45"
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
          />
        </div>
        <div class="info-div">
          <!-- <div class="name-tag-item">-->
          <span class="name-span"
            >{{ props.name }} 
            <el-tag class="role-tag" :type="roleType"
              >{{ props.isRoleOwner ? 'Owner' : props.groupRole }}
            </el-tag>
          </span>

          <!-- </div> -->

          <span class="email-span">{{ props.email }}</span>
        </div>
      </div>
      <div class="member-operation">
        <el-button
          v-if="showAddModeratorButton"
          class="member-button"
          @click="addModerator"
          type="success"
          size="small"
          :icon="User"
          text
        />
        <el-button
          v-if="showDeleteModeratorButton"
          class="member-button"
          @click="deleteModerator"
          type="warning"
          size="small"
          :icon="Remove"
          text
        />
        <el-button
          v-if="showDeleteMemberButton"
          class="member-button"
          @click="deleteMember"
          type="danger"
          size="small"
          :icon="Delete"
          text
        />
      </div>
    </div>
    <el-divider class="divider"></el-divider>
  </div>
</template>

<script setup>
import { User, Delete, Remove } from '@element-plus/icons-vue'
import chatAPI from '@/api/chat'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ref, computed } from 'vue'
import { useChatStore } from '../../stores/chat'

const props = defineProps([
  'name',
  'index',
  'email',
  'uid',
  'groupUuid',
  'groupRole',
  'isUserAdmin',
  'isUserOwner',
  'isRoleOwner',
  'isUserInChannel'
])
const itemLoading = ref(false)
const chatStore = useChatStore()
const roleType = computed(() => {
  if (props.isRoleOwner) {
    return 'warning'
  } else if (props.groupRole === 'Manager') {
    return ''
  } else {
    return 'info'
  }
})
const showAddModeratorButton = computed(() => {
  if (!props.isUserInChannel) {
    return false
  }
  if (props.isUserOwner) {
    // if aleady a moderator
    if (props.groupRole === 'Manager') {
      return false
    } else {
      return true
    }
    //just a normal admin
  } else if (props.isUserAdmin) {
    if (props.isRoleOwner) {
      return false
      //if aleady a moderator
    } else if (props.groupRole === 'Manager') {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
})
const showDeleteModeratorButton = computed(() => {
  if (!props.isUserInChannel) {
    return false
  }
  if (props.isUserOwner) {
    if (props.isRoleOwner) {
      return false
    } else if (props.groupRole === 'Manager') {
      return true
    } else {
      return false
    }
  } else if (props.isUserAdmin) {
    if (props.isRoleOwner) {
      return false
    } else if (props.groupRole === 'Manager') {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
})
const showDeleteMemberButton = computed(() => {
  if (!props.isUserInChannel) {
    return false
  }
  if (props.isUserOwner) {
    if (props.isRoleOwner) {
      return false
    } else return true
  } else if (props.isUserAdmin) {
    if (props.isRoleOwner) {
      return false
    } else {
      return true
    }
  } else {
    return false
  }
})

async function deleteMember() {
  try {
    await ElMessageBox.confirm(`Are you sure you want to delete ${props.name}?`, 'Warning', {
      confirmButtonText: 'Yes, I am sure',
      cancelButtonText: 'No',
      type: 'warning'
    })
  } catch (error) {
    return
  }

  try {
    itemLoading.value = true
    let result = await chatAPI.deleteMember(props.groupUuid, props.uid)
    console.log(result)
    if (result.data.apiStatus === 'ok') {
      ElMessage({
        message: 'The user has been deleted successfully',
        type: 'success'
      })
    }
    chatStore.needToUpdateGroupMembers = true
    itemLoading.value = false
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'delete failed',
      type: 'error'
    })
    itemLoading.value = false
  }
}

async function addModerator() {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want ${props.name} to be an manager?`,
      'Info',
      {
        confirmButtonText: 'Yes, I am sure',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
  } catch (error) {
    return
  }

  try {
    itemLoading.value = true
    let result = await chatAPI.addModerator(props.groupUuid, props.uid)
    console.log(result)
    if (result.data.apiStatus === 'ok') {
      ElMessage({
        message: 'The user has been upgraded successfully',
        type: 'success'
      })
    }
    chatStore.needToUpdateGroupMembers = true
    itemLoading.value = false
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'delete failed',
      type: 'error'
    })
    itemLoading.value = false
  }
}

async function deleteModerator() {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${props.name}'s manager authority?`,
      'Warning',
      {
        confirmButtonText: 'Yes, I am sure',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )
  } catch (error) {
    return
  }

  try {
    itemLoading.value = true
    let result = await chatAPI.deleteModerator(props.groupUuid, props.uid)
    console.log(result)
    if (result.data.apiStatus === 'ok') {
      ElMessage({
        message: `${props.name}'s manager authority has been deleted successfully`,
        type: 'success'
      })
    }
    chatStore.needToUpdateGroupMembers = true
    itemLoading.value = false
  } catch (error) {
    console.log(error)
    ElMessage({
      message: error.response ? error.response.data.pkg.msg : 'delete failed',
      type: 'error'
    })
    itemLoading.value = false
  }
}
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
.info-div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.member-operation {
  display: flex;
  align-items: center;
  /* justify-content: center; */
}

.member-button {
  font-size: 18px;
  margin: 0px;
}

.name-span {
  padding-top: 10px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: center;
  word-wrap: break-word;
}

.email-span {
  display: flex;
  height: 50%;
  align-items: center;
  justify-content: center;
  padding-bottom: 15px;
  color: darkgray;
}

.menu-item {
  padding-left: 10px;
  padding-right: 10px;
  --el-menu-item-height: 70px;
  border-bottom: 1px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.divider {
  position: absolute;
  margin: 0px;
  width: 77%;
  --el-border-color: #dcdfe642;
  right: 0;
}

.role-tag {
  margin-left: 5px;
  height: 20px;
  --el-color-primary-light-8: #d9ecff00;
  --el-color-info-light-8: #e9e9eb00;
}
</style>
