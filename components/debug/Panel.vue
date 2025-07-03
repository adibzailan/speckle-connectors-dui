<template>
  <Teleport to="body">
    <div
      v-if="debugStore.isEnabled && debugStore.isPanelVisible"
      class="fixed bottom-4 right-4 w-[480px] max-h-[600px] bg-foundation-2 border border-outline-3 rounded-lg shadow-2xl z-[9999] flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-outline-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <h3 class="text-sm font-semibold text-foreground">Debug Panel</h3>
          <span class="text-xs text-foreground-2">
            {{ debugStore.events.length }} events
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="debugStore.exportDebugLog"
            class="text-xs text-foreground-2 hover:text-foreground px-2 py-1 hover:bg-foundation rounded"
            title="Export debug log"
          >
            Export
          </button>
          <button
            @click="debugStore.clearEvents()"
            class="text-xs text-foreground-2 hover:text-foreground px-2 py-1 hover:bg-foundation rounded"
            title="Clear all events"
          >
            Clear
          </button>
          <button
            @click="debugStore.togglePanel"
            class="text-foreground-2 hover:text-foreground p-1"
            title="Close panel (Ctrl+Shift+D)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-outline-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-xs font-medium transition-colors',
            activeTab === tab.id
              ? 'text-foreground border-b-2 border-primary'
              : 'text-foreground-2 hover:text-foreground'
          ]"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            :class="[
              'ml-1 px-1.5 py-0.5 text-xs rounded-full',
              activeTab === tab.id
                ? 'bg-primary-muted text-primary'
                : 'bg-foundation text-foreground-2'
            ]"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Errors Tab -->
        <div v-if="activeTab === 'errors'" class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="debugStore.errorEvents.length === 0" class="text-center text-foreground-2 text-sm py-8">
            No errors captured
          </div>
          <div
            v-for="event in debugStore.errorEvents"
            :key="event.id"
            class="bg-foundation border border-error/20 rounded p-3 text-xs font-mono"
          >
            <div class="flex items-start justify-between mb-1">
              <span class="text-error font-semibold">{{ event.category }}</span>
              <span class="text-foreground-3">{{ formatTime(event.timestamp) }}</span>
            </div>
            <div class="text-foreground mb-2">{{ event.message }}</div>
            <details v-if="event.stackTrace" class="text-foreground-2">
              <summary class="cursor-pointer hover:text-foreground">Stack trace</summary>
              <pre class="mt-2 text-xs overflow-x-auto">{{ event.stackTrace }}</pre>
            </details>
          </div>
        </div>

        <!-- Bridge Tab -->
        <div v-if="activeTab === 'bridge'" class="flex-1 overflow-y-auto p-4 space-y-2">
          <div v-if="debugStore.bridgeEvents.length === 0" class="text-center text-foreground-2 text-sm py-8">
            No bridge events captured
          </div>
          <div
            v-for="event in debugStore.bridgeEvents"
            :key="event.id"
            class="bg-foundation rounded p-2 text-xs font-mono"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-primary">{{ event.category }}</span>
              <span class="text-foreground-3">{{ formatTime(event.timestamp) }}</span>
            </div>
            <div class="text-foreground-2">{{ event.message }}</div>
            <details v-if="event.data" class="mt-1">
              <summary class="cursor-pointer text-foreground-3 hover:text-foreground">Data</summary>
              <pre class="mt-1 text-xs overflow-x-auto text-foreground-2">{{ JSON.stringify(event.data, null, 2) }}</pre>
            </details>
          </div>
        </div>

        <!-- State Tab -->
        <div v-if="activeTab === 'state'" class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div class="bg-foundation rounded p-3">
              <h4 class="text-xs font-semibold text-foreground mb-2">Host App</h4>
              <div class="text-xs font-mono space-y-1">
                <div class="text-foreground-2">
                  Model Cards: <span class="text-foreground">{{ hostApp.modelCards.length }}</span>
                </div>
                <div class="text-foreground-2">
                  App: <span class="text-foreground">{{ hostApp.hostApplication || 'Unknown' }}</span>
                </div>
                <div class="text-foreground-2">
                  File: <span class="text-foreground">{{ hostApp.documentName || 'No document' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-foundation rounded p-3">
              <h4 class="text-xs font-semibold text-foreground mb-2">Accounts</h4>
              <div class="text-xs font-mono space-y-1">
                <div class="text-foreground-2">
                  Total: <span class="text-foreground">{{ accounts.accounts.length }}</span>
                </div>
                <div class="text-foreground-2">
                  Active: <span class="text-foreground">{{ accounts.activeAccount?.name || 'None' }}</span>
                </div>
              </div>
            </div>

            <div class="bg-foundation rounded p-3">
              <h4 class="text-xs font-semibold text-foreground mb-2">Selection</h4>
              <div class="text-xs font-mono space-y-1">
                <div class="text-foreground-2">
                  Objects: <span class="text-foreground">{{ selection.selectedObjects.length }}</span>
                </div>
                <div class="text-foreground-2">
                  Filters: <span class="text-foreground">{{ selection.filters.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Tab -->
        <div v-if="activeTab === 'performance'" class="flex-1 overflow-y-auto p-4">
          <div class="bg-foundation rounded p-3 mb-3">
            <div class="text-xs font-mono space-y-1">
              <div class="text-foreground-2">
                Average Bridge Latency: 
                <span class="text-foreground">{{ debugStore.averageLatency }}ms</span>
              </div>
              <div class="text-foreground-2">
                Active Operations: 
                <span class="text-foreground">{{ debugStore.activeMetrics.size }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <div
              v-for="metric in debugStore.recentMetrics"
              :key="metric.operation + metric.startTime"
              class="bg-foundation rounded p-2 text-xs font-mono"
            >
              <div class="flex items-center justify-between">
                <span class="text-primary">{{ metric.operation }}</span>
                <span :class="[
                  'font-semibold',
                  metric.duration! > 1000 ? 'text-error' :
                  metric.duration! > 500 ? 'text-warning' :
                  'text-success'
                ]">
                  {{ metric.duration!.toFixed(2) }}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDebugStore } from '@/store/debug'
import { useHostAppStore } from '@/store/hostApp'
import { useAccountsStore } from '@/store/accounts'
import { useSelectionStore } from '@/store/selection'

const debugStore = useDebugStore()
const hostApp = useHostAppStore()
const accounts = useAccountsStore()
const selection = useSelectionStore()

const activeTab = ref<'errors' | 'bridge' | 'state' | 'performance'>('bridge')

const tabs = computed(() => [
  { id: 'errors', label: 'Errors', count: debugStore.errorEvents.length },
  { id: 'bridge', label: 'Bridge', count: debugStore.bridgeEvents.length },
  { id: 'state', label: 'State', count: 0 },
  { id: 'performance', label: 'Performance', count: debugStore.recentMetrics.length }
])

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

// Keyboard shortcut handler
function handleKeyPress(e: KeyboardEvent) {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    debugStore.togglePanel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>