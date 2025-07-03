import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DebugEvent {
  id: string
  timestamp: number
  type: 'bridge' | 'error' | 'state' | 'performance'
  category: string
  message: string
  data?: any
  error?: Error
  stackTrace?: string
}

export interface PerformanceMetric {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
}

export const useDebugStore = defineStore('debug', () => {
  // State
  const isEnabled = ref(false)
  const isPanelVisible = ref(false)
  const events = ref<DebugEvent[]>([])
  const maxEvents = ref(500)
  const activeMetrics = ref<Map<string, PerformanceMetric>>(new Map())
  const completedMetrics = ref<PerformanceMetric[]>([])
  
  // Computed
  const bridgeEvents = computed(() => 
    events.value.filter(e => e.type === 'bridge')
  )
  
  const errorEvents = computed(() => 
    events.value.filter(e => e.type === 'error')
  )
  
  const stateEvents = computed(() => 
    events.value.filter(e => e.type === 'state')
  )
  
  const performanceEvents = computed(() => 
    events.value.filter(e => e.type === 'performance')
  )
  
  const recentMetrics = computed(() => 
    completedMetrics.value.slice(-50)
  )
  
  const averageLatency = computed(() => {
    const bridgeMetrics = recentMetrics.value.filter(m => 
      m.operation.startsWith('bridge.')
    )
    if (bridgeMetrics.length === 0) return 0
    
    const total = bridgeMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    return Math.round(total / bridgeMetrics.length)
  })
  
  // Actions
  function initialize() {
    // Check if debug mode should be enabled
    const urlParams = new URLSearchParams(window.location.search)
    const debugParam = urlParams.get('debug') === 'true'
    const isDev = import.meta.env.DEV
    const storedPreference = localStorage.getItem('debugMode') === 'true'
    
    isEnabled.value = debugParam || isDev || storedPreference
    
    if (isEnabled.value && storedPreference) {
      isPanelVisible.value = true
    }
  }
  
  function togglePanel() {
    isPanelVisible.value = !isPanelVisible.value
  }
  
  function toggleDebugMode() {
    isEnabled.value = !isEnabled.value
    localStorage.setItem('debugMode', isEnabled.value.toString())
    
    if (!isEnabled.value) {
      isPanelVisible.value = false
    }
  }
  
  function addEvent(event: Omit<DebugEvent, 'id' | 'timestamp'>) {
    if (!isEnabled.value) return
    
    const newEvent: DebugEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    
    events.value.unshift(newEvent)
    
    // Limit events to prevent memory issues
    if (events.value.length > maxEvents.value) {
      events.value = events.value.slice(0, maxEvents.value)
    }
  }
  
  function logBridgeEvent(category: string, message: string, data?: any) {
    addEvent({
      type: 'bridge',
      category,
      message,
      data
    })
  }
  
  function logError(category: string, message: string, error?: Error) {
    addEvent({
      type: 'error',
      category,
      message,
      error,
      stackTrace: error?.stack
    })
  }
  
  function logStateChange(category: string, message: string, data?: any) {
    addEvent({
      type: 'state',
      category,
      message,
      data
    })
  }
  
  function startPerformanceMetric(operation: string): string {
    const id = crypto.randomUUID()
    activeMetrics.value.set(id, {
      operation,
      startTime: performance.now()
    })
    return id
  }
  
  function endPerformanceMetric(id: string) {
    const metric = activeMetrics.value.get(id)
    if (!metric) return
    
    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime
    
    completedMetrics.value.push(metric)
    activeMetrics.value.delete(id)
    
    // Limit completed metrics
    if (completedMetrics.value.length > 100) {
      completedMetrics.value = completedMetrics.value.slice(-100)
    }
    
    addEvent({
      type: 'performance',
      category: metric.operation,
      message: `${metric.operation} completed in ${metric.duration.toFixed(2)}ms`,
      data: metric
    })
  }
  
  function clearEvents(type?: DebugEvent['type']) {
    if (type) {
      events.value = events.value.filter(e => e.type !== type)
    } else {
      events.value = []
    }
  }
  
  function exportDebugLog() {
    const debugData = {
      timestamp: new Date().toISOString(),
      events: events.value,
      metrics: completedMetrics.value,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        appVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
      }
    }
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `speckle-debug-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return {
    // State
    isEnabled,
    isPanelVisible,
    events,
    maxEvents,
    activeMetrics,
    completedMetrics,
    
    // Computed
    bridgeEvents,
    errorEvents,
    stateEvents,
    performanceEvents,
    recentMetrics,
    averageLatency,
    
    // Actions
    initialize,
    togglePanel,
    toggleDebugMode,
    addEvent,
    logBridgeEvent,
    logError,
    logStateChange,
    startPerformanceMetric,
    endPerformanceMetric,
    clearEvents,
    exportDebugLog
  }
})