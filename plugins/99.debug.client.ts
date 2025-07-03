import { useDebugStore } from '@/store/debug'

export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client side
  if (process.server) return

  const debugStore = useDebugStore()
  
  // Initialize debug mode based on environment and URL params
  debugStore.initialize()
  
  // If debug mode is not enabled, don't intercept anything
  if (!debugStore.isEnabled) return
  
  // Intercept bridge communications
  nuxtApp.hook('app:mounted', () => {
    const bindings = window.bindings
    if (!bindings) {
      debugStore.logError('Plugin', 'No bindings found on window object')
      return
    }
    
    // Store original methods
    const originalSend = bindings.send.bind(bindings)
    const originalInvoke = bindings.invoke.bind(bindings)
    const originalOn = bindings.on.bind(bindings)
    
    // Override send method
    bindings.send = function(eventName: string, data?: any) {
      debugStore.logBridgeEvent('SEND', eventName, data)
      
      const metricId = debugStore.startPerformanceMetric(`bridge.send.${eventName}`)
      try {
        const result = originalSend(eventName, data)
        debugStore.endPerformanceMetric(metricId)
        return result
      } catch (error) {
        debugStore.endPerformanceMetric(metricId)
        debugStore.logError('Bridge', `Failed to send ${eventName}`, error as Error)
        throw error
      }
    }
    
    // Override invoke method
    bindings.invoke = async function(methodName: string, args?: any) {
      debugStore.logBridgeEvent('INVOKE', methodName, args)
      
      const metricId = debugStore.startPerformanceMetric(`bridge.invoke.${methodName}`)
      try {
        const result = await originalInvoke(methodName, args)
        debugStore.endPerformanceMetric(metricId)
        debugStore.logBridgeEvent('INVOKE_RESULT', methodName, result)
        return result
      } catch (error) {
        debugStore.endPerformanceMetric(metricId)
        debugStore.logError('Bridge', `Failed to invoke ${methodName}`, error as Error)
        throw error
      }
    }
    
    // Override on method to track event listeners
    bindings.on = function(eventName: string, handler: (data: any) => void) {
      debugStore.logBridgeEvent('LISTEN', eventName, { registered: true })
      
      // Wrap the handler to log incoming events
      const wrappedHandler = (data: any) => {
        debugStore.logBridgeEvent('EVENT', eventName, data)
        handler(data)
      }
      
      return originalOn(eventName, wrappedHandler)
    }
  })
  
  // Intercept Vue errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    debugStore.logError('Vue', `Component error: ${info}`, error as Error)
    
    // Log component info if available
    if (instance) {
      debugStore.logStateChange('Vue', 'Component error context', {
        component: instance.$options.name || 'Unknown',
        info
      })
    }
    
    // Re-throw in development
    if (import.meta.env.DEV) {
      console.error('Vue error:', error)
    }
  }
  
  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugStore.logError('Promise', 'Unhandled rejection', new Error(event.reason))
  })
  
  // Track Pinia store mutations
  nuxtApp.hook('app:mounted', () => {
    const pinia = nuxtApp.$pinia
    
    pinia.use(({ store }) => {
      store.$onAction(({
        name,
        store: actionStore,
        args,
        after,
        onError
      }) => {
        const metricId = debugStore.startPerformanceMetric(`store.${actionStore.$id}.${name}`)
        
        debugStore.logStateChange('Store', `${actionStore.$id}.${name}`, { args })
        
        after(() => {
          debugStore.endPerformanceMetric(metricId)
        })
        
        onError((error) => {
          debugStore.endPerformanceMetric(metricId)
          debugStore.logError('Store', `Action failed: ${actionStore.$id}.${name}`, error)
        })
      })
    })
  })
  
  // Log initial app state
  debugStore.logStateChange('App', 'Debug mode initialized', {
    enabled: debugStore.isEnabled,
    environment: import.meta.env.MODE,
    url: window.location.href
  })
})