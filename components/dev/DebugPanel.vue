<template>
  <div
    v-if="isDebugMode"
    class="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-foundation-2 border border-outline-3 rounded-lg shadow-xl z-50 p-4"
  >
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-sm font-bold text-foreground">Debug Panel</h3>
      <button
        @click="isExpanded = !isExpanded"
        class="text-foreground-2 hover:text-foreground"
      >
        {{ isExpanded ? '−' : '+' }}
      </button>
    </div>

    <div v-if="isExpanded" class="space-y-3">
      <!-- Bridge Events Log -->
      <div>
        <h4 class="text-xs font-semibold text-foreground-2 mb-1">Bridge Events</h4>
        <div class="bg-foundation text-xs font-mono p-2 rounded max-h-32 overflow-y-auto">
          <div
            v-for="(event, idx) in bridgeEvents"
            :key="idx"
            class="mb-1"
          >
            <span class="text-primary">{{ event.type }}</span>: 
            <span class="text-foreground-2">{{ event.name }}</span>
            <span v-if="event.data" class="text-xs text-foreground-3"> {{ JSON.stringify(event.data) }}</span>
          </div>
        </div>
      </div>

      <!-- Store State -->
      <div>
        <h4 class="text-xs font-semibold text-foreground-2 mb-1">Store State</h4>
        <div class="bg-foundation text-xs font-mono p-2 rounded">
          <div>Cards: {{ hostApp.modelCards.length }}</div>
          <div>Accounts: {{ accounts.accounts.length }}</div>
          <div>Selected: {{ selection.selectedObjects.length }} objects</div>
        </div>
      </div>

      <!-- Performance -->
      <div>
        <h4 class="text-xs font-semibold text-foreground-2 mb-1">Performance</h4>
        <div class="bg-foundation text-xs font-mono p-2 rounded">
          <div>Last render: {{ lastRenderTime }}ms</div>
          <div>Bridge latency: {{ bridgeLatency }}ms</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useHostAppStore } from '@/store/hostApp'
import { useAccountsStore } from '@/store/accounts'
import { useSelectionStore } from '@/store/selection'

const route = useRoute()
const hostApp = useHostAppStore()
const accounts = useAccountsStore()
const selection = useSelectionStore()

const isExpanded = ref(true)
const bridgeEvents = ref<Array<{type: string, name: string, data?: any}>>([])
const lastRenderTime = ref(0)
const bridgeLatency = ref(0)

// Check if debug mode is enabled
const isDebugMode = computed(() => {
  return route.query.debug === 'true' || import.meta.env.DEV
})

// Intercept bridge communications
const originalSend = window.bindings?.send
const originalInvoke = window.bindings?.invoke

onMounted(() => {
  if (!isDebugMode.value) return

  // Override bridge methods to log events
  if (window.bindings && originalSend) {
    window.bindings.send = function(...args: any[]) {
      const [eventName, data] = args
      bridgeEvents.value.unshift({
        type: 'SEND',
        name: eventName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      return originalSend.apply(this, args)
    }
  }

  if (window.bindings && originalInvoke) {
    window.bindings.invoke = async function(...args: any[]) {
      const [methodName, data] = args
      const start = performance.now()
      
      bridgeEvents.value.unshift({
        type: 'INVOKE',
        name: methodName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      
      const result = await originalInvoke.apply(this, args)
      bridgeLatency.value = Math.round(performance.now() - start)
      return result
    }
  }

  // Add keyboard shortcut to toggle debug panel
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      isExpanded.value = !isExpanded.value
    }
  }
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  // Restore original methods
  if (window.bindings) {
    if (originalSend) window.bindings.send = originalSend
    if (originalInvoke) window.bindings.invoke = originalInvoke
  }
})
</script>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useHostAppStore } from '@/store/hostApp'
import { useAccountsStore } from '@/store/accounts'
import { useSelectionStore } from '@/store/selection'

const route = useRoute()
const hostApp = useHostAppStore()
const accounts = useAccountsStore()
const selection = useSelectionStore()

const isExpanded = ref(true)
const bridgeEvents = ref<Array<{type: string, name: string, data?: any}>>([])
const lastRenderTime = ref(0)
const bridgeLatency = ref(0)

// Check if debug mode is enabled
const isDebugMode = computed(() => {
  return route.query.debug === 'true' || import.meta.env.DEV
})

// Intercept bridge communications
const originalSend = window.bindings?.send
const originalInvoke = window.bindings?.invoke

onMounted(() => {
  if (!isDebugMode.value) return

  // Override bridge methods to log events
  if (window.bindings && originalSend) {
    window.bindings.send = function(...args: any[]) {
      const [eventName, data] = args
      bridgeEvents.value.unshift({
        type: 'SEND',
        name: eventName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      return originalSend.apply(this, args)
    }
  }

  if (window.bindings && originalInvoke) {
    window.bindings.invoke = async function(...args: any[]) {
      const [methodName, data] = args
      const start = performance.now()
      
      bridgeEvents.value.unshift({
        type: 'INVOKE',
        name: methodName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      
      const result = await originalInvoke.apply(this, args)
      bridgeLatency.value = Math.round(performance.now() - start)
      return result
    }
  }

  // Add keyboard shortcut to toggle debug panel
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      isExpanded.value = !isExpanded.value
    }
  }
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  // Restore original methods
  if (window.bindings) {
    if (originalSend) window.bindings.send = originalSend
    if (originalInvoke) window.bindings.invoke = originalInvoke
  }
})
</script>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useHostAppStore } from '@/store/hostApp'
import { useAccountsStore } from '@/store/accounts'
import { useSelectionStore } from '@/store/selection'

const route = useRoute()
const hostApp = useHostAppStore()
const accounts = useAccountsStore()
const selection = useSelectionStore()

const isExpanded = ref(true)
const bridgeEvents = ref<Array<{type: string, name: string, data?: any}>>([])
const lastRenderTime = ref(0)
const bridgeLatency = ref(0)

// Check if debug mode is enabled
const isDebugMode = computed(() => {
  return route.query.debug === 'true' || import.meta.env.DEV
})

// Intercept bridge communications
const originalSend = window.bindings?.send
const originalInvoke = window.bindings?.invoke

onMounted(() => {
  if (!isDebugMode.value) return

  // Override bridge methods to log events
  if (window.bindings && originalSend) {
    window.bindings.send = function(...args: any[]) {
      const [eventName, data] = args
      bridgeEvents.value.unshift({
        type: 'SEND',
        name: eventName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      return originalSend.apply(this, args)
    }
  }

  if (window.bindings && originalInvoke) {
    window.bindings.invoke = async function(...args: any[]) {
      const [methodName, data] = args
      const start = performance.now()
      
      bridgeEvents.value.unshift({
        type: 'INVOKE',
        name: methodName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      
      const result = await originalInvoke.apply(this, args)
      bridgeLatency.value = Math.round(performance.now() - start)
      return result
    }
  }

  // Add keyboard shortcut to toggle debug panel
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      isExpanded.value = !isExpanded.value
    }
  }
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  // Restore original methods
  if (window.bindings) {
    if (originalSend) window.bindings.send = originalSend
    if (originalInvoke) window.bindings.invoke = originalInvoke
  }
})
</script>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useHostAppStore } from '@/store/hostApp'
import { useAccountsStore } from '@/store/accounts'
import { useSelectionStore } from '@/store/selection'

const route = useRoute()
const hostApp = useHostAppStore()
const accounts = useAccountsStore()
const selection = useSelectionStore()

const isExpanded = ref(true)
const bridgeEvents = ref<Array<{type: string, name: string, data?: any}>>([])
const lastRenderTime = ref(0)
const bridgeLatency = ref(0)

// Check if debug mode is enabled
const isDebugMode = computed(() => {
  return route.query.debug === 'true' || import.meta.env.DEV
})

// Intercept bridge communications
const originalSend = window.bindings?.send
const originalInvoke = window.bindings?.invoke

onMounted(() => {
  if (!isDebugMode.value) return

  // Override bridge methods to log events
  if (window.bindings && originalSend) {
    window.bindings.send = function(...args: any[]) {
      const [eventName, data] = args
      bridgeEvents.value.unshift({
        type: 'SEND',
        name: eventName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      return originalSend.apply(this, args)
    }
  }

  if (window.bindings && originalInvoke) {
    window.bindings.invoke = async function(...args: any[]) {
      const [methodName, data] = args
      const start = performance.now()
      
      bridgeEvents.value.unshift({
        type: 'INVOKE',
        name: methodName,
        data: data
      })
      if (bridgeEvents.value.length > 50) bridgeEvents.value.pop()
      
      const result = await originalInvoke.apply(this, args)
      bridgeLatency.value = Math.round(performance.now() - start)
      return result
    }
  }

  // Add keyboard shortcut to toggle debug panel
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      isExpanded.value = !isExpanded.value
    }
  }
  window.addEventListener('keydown', handleKeyPress)
})

onBeforeUnmount(() => {
  // Restore original methods
  if (window.bindings) {
    if (originalSend) window.bindings.send = originalSend
    if (originalInvoke) window.bindings.invoke = originalInvoke
  }
})
</script>