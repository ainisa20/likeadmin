<template>
  <div class="dify-chat-container">
    <div
      class="dify-chat-bubble"
      :style="{ backgroundColor: difyStore.config.buttonColor }"
      @click="toggleWindow"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
        <path d="M7 9H17V11H7V9Z" fill="white"/>
        <path d="M7 12H14V14H7V12Z" fill="white"/>
      </svg>
    </div>

    <Transition name="fade">
      <div v-show="isOpen" class="dify-chat-window" :style="windowStyle">
        <div class="chat-header">
          <span class="chat-title">智能助手</span>
          <button class="close-btn" @click="toggleWindow">×</button>
        </div>

        <div class="chat-messages" ref="messagesRef">
          <div
            v-for="msg in difyStore.messages"
            :key="msg.id"
            :class="['message', msg.role]"
          >
            <div class="message-content">{{ msg.content }}</div>
          </div>
          <div v-if="difyStore.isTyping" class="message assistant typing">
            <div class="typing-indicator">...</div>
          </div>
        </div>

        <div class="chat-input">
          <textarea
            v-model="inputQuery"
            @keydown.enter.exact.prevent="send"
            placeholder="输入消息..."
            rows="1"
            :disabled="difyStore.isTyping"
          />
          <button
            @click="send"
            :disabled="!inputQuery.trim() || difyStore.isTyping"
            class="send-btn"
          >
            发送
          </button>
        </div>

        <div v-if="difyStore.error" class="error-message">
          {{ difyStore.error }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useDifyStore } from '@/stores/dify'
import { nextTick, onMounted, ref, computed } from 'vue'

const difyStore = useDifyStore()
const isOpen = ref(false)
const inputQuery = ref('')
const messagesRef = ref<HTMLElement>()

const windowStyle = computed(() => ({
  width: `${difyStore.config.windowWidth}rem`,
  height: `${difyStore.config.windowHeight}rem`
}))

const toggleWindow = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => scrollToBottom())
  }
}

const send = async () => {
  if (!inputQuery.value.trim() || difyStore.isTyping) return

  const query = inputQuery.value
  inputQuery.value = ''

  await difyStore.sendMessage(query)

  nextTick(() => scrollToBottom())
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

onMounted(async () => {
  if (!difyStore.isConfigured) {
    await difyStore.initConfig()
  }
})
</script>

<style scoped lang="scss">
.dify-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dify-chat-bubble {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
}

.dify-chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;

  .chat-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #e5e7eb;
      border-radius: 4px;
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }
}

.message {
  display: flex;
  max-width: 80%;

  &.user {
    align-self: flex-end;

    .message-content {
      background: #3b82f6;
      color: white;
      border-radius: 12px 12px 0 12px;
    }
  }

  &.assistant {
    align-self: flex-start;

    .message-content {
      background: #f3f4f6;
      color: #111827;
      border-radius: 12px 12px 12px 0;
    }
  }

  &.typing {
    .typing-indicator {
      padding: 12px 16px;
      background: #f3f4f6;
      border-radius: 12px 12px 12px 0;
      animation: pulse 1.5s infinite;
    }
  }

  .message-content {
    padding: 12px 16px;
    word-wrap: break-word;
    line-height: 1.5;
  }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;

  textarea {
    flex: 1;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 14px;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;

    &:focus {
      border-color: #3b82f6;
    }

    &:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }
  }

  .send-btn {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }
}

.error-message {
  padding: 12px 16px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 14px;
  border-top: 1px solid #fecaca;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
