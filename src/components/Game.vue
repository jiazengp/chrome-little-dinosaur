<script setup lang="ts">
let gameInstance: Phaser.Game
const downloaded = ref<boolean>(false)
const containerId = ref<string>('game-container')
onMounted(async() => {
  const game = await import('~/game')
  downloaded.value = true
  nextTick(() => {
    gameInstance = game.launch(containerId.value)
  })
})
onUnmounted(() => {
  gameInstance.destroy(false)
})
</script>

<template>
  <div :class="$style.container">
    <div v-if="downloaded" :id="containerId" />
    <div v-else class="placeholder" :class="$style.placeholder">
      Downloading ...
    </div>
  </div>
</template>

<style module>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
}
.placeholder {
  font-size: 2rem;
  font-family: 'Courier New', Courier, monospace;
}
</style>
