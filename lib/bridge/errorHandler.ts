import type { ToastNotification } from '@speckle/ui-components'
import { ToastNotificationType } from '@speckle/ui-components'
import type { Emitter } from 'nanoevents'
import { useHostAppStore } from '~/store/hostApp'
import { useDebugStore } from '~/store/debug'

export type HostAppError = {
  message: string
  error: string
  stackTrace: string
}

export class BaseBridgeErrorHandler {
  constructor(emitter: Emitter) {
    emitter.on('errorOnResponse', (data: string) => {
      this.handleError(data)
    })
  }

  private handleError(data: string) {
    const store = useHostAppStore()
    const debugStore = useDebugStore()
    const parsedData = JSON.parse(data) as Record<string, unknown> as HostAppError
    store.setHostAppError(parsedData)
    
    // Log to debug store if enabled
    if (debugStore.isEnabled) {
      debugStore.logError('Host App', parsedData.message, new Error(parsedData.stackTrace))
    }
    
    const notification: ToastNotification = {
      type: ToastNotificationType.Danger,
      title: 'Host App Error',
      description: parsedData.message,
      cta: {
        title: 'Show details',
        onClick: () => (store.showErrorDialog = true)
      }
    }
    store.setNotification(notification)
  }
}
