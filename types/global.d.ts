// Global type declarations

interface IBindings {
  send: (eventName: string, data?: any) => void
  invoke: (methodName: string, args?: any) => Promise<any>
  on: (eventName: string, handler: (data: any) => void) => () => void
}

declare global {
  interface Window {
    bindings?: IBindings
  }
}

export {}