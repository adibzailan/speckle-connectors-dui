<template>
  <div>
    <div v-show="!isAddingAccount" class="text-foreground-2 my-2 space-y-2">
      <div v-if="showCustomServerInput">
        <FormTextInput
          v-model="customServerUrl"
          name="name"
          :show-label="false"
          placeholder="https://app.speckle.systems"
          color="foundation"
          autocomplete="off"
          show-clear
          @clear="showCustomServerInput = false"
        />
      </div>
      <FormButton full-width @click="startAccountAddFlow()">Sign In</FormButton>
      <FormButton
        text
        size="sm"
        full-width
        @click="showCustomServerInput = !showCustomServerInput"
      >
        {{ showCustomServerInput ? 'Use default server' : 'Set custom server url' }}
      </FormButton>
    </div>

    <div v-show="isAddingAccount" class="text-foreground-2 mt-2 mb-4 space-y-2">
      <div class="text-sm text-center">
        Please check your browser: waiting for authorization to complete.
      </div>
      <div class="py-2"><CommonLoadingBar :loading="isAddingAccount" /></div>
      <div v-if="showHelp" class="bg-blue-500/10 p-2 rounded-md space-y-2">
        <div class="text-sm text-center">Having trouble?</div>
        <FormButton size="sm" full-width @click="restartFlow()">Retry</FormButton>
        <FormButton
          text
          size="sm"
          full-width
          @click="$openUrl('https://speckle.community')"
        >
          Get in touch with us
        </FormButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useAccountStore } from '~~/store/accounts'
import { useHostAppStore } from '~/store/hostApp'
import { ToastNotificationType } from '@speckle/ui-components'
import { useMixpanel } from '~/lib/core/composables/mixpanel'

const accountStore = useAccountStore()
const hostApp = useHostAppStore()
const app = useNuxtApp()
const { trackEvent } = useMixpanel()

const customServerUrl = ref<string | undefined>(undefined)
const isAddingAccount = ref(false)
const showHelp = ref(false)
const showCustomServerInput = ref(false)

const accountCheckerIntervalFn = useIntervalFn(
  async () => {
    const previousAccountCount = accountStore.accounts.length
    await accountStore.refreshAccounts()
    const currentAccountCount = accountStore.accounts.length
    if (previousAccountCount !== currentAccountCount) {
      isAddingAccount.value = false
      showCustomServerInput.value = false
      accountCheckerIntervalFn.pause()
      trackEvent('DUI Account Added')
    }
  },
  1000,
  { immediate: false }
)

const startAccountAddFlow = () => {
  isAddingAccount.value = true
  accountCheckerIntervalFn.resume()
  setTimeout(() => {
    showHelp.value = true
  }, 10_000)
  const url = customServerUrl.value
    ? `http://localhost:29364/auth/add-account?serverUrl=${
        new URL(customServerUrl.value).origin
      }`
    : `http://localhost:29364/auth/add-account`

  app.$openUrl(url)

  // this is a annoying timeout that we cannot detect if user added same account or not.
  setTimeout(() => {
    if (isAddingAccount.value) {
      isAddingAccount.value = false
      showCustomServerInput.value = false
      accountCheckerIntervalFn.pause()
      // Note to Dim: not sure about toast
      hostApp.setNotification({
        title: 'Sign In',
        type: ToastNotificationType.Info,
        description:
          'Sign in timed out. This may have happened because you tried adding an existing account.'
      })
      // TODO: we could log it to sentry/seq later to see how likely it happens?
    }
  }, 30_000)
}

const restartFlow = () => {
  isAddingAccount.value = false
  showHelp.value = false
}
</script>
