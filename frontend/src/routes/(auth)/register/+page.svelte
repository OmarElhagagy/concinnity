<script lang="ts">
  import ky from '$lib/api/ky'
  import Button from '$lib/components/Button.svelte'
  import TextInput from '$lib/components/TextInput.svelte'

  let register = $state({ username: '', password: '', email: '' })
  let disabled = $state(false)
  let error: string | null = $state(null)

  async function onRegister() {
    disabled = true
    try {
      await ky.post(`api/register`, { json: register }).json<{ token: string; username: string }>()
      error = ''
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : (e?.toString() ?? `Failed to register!`)
    }
    disabled = false
  }
</script>

<h2>Register</h2>
<br />
<label for="register-username">Username</label>
<TextInput
  id="register-username"
  bind:value={register.username}
  error={!!error}
  {disabled}
  type="email"
  placeholder="e.g. retrixe"
/>
<label for="register-email">E-mail</label>
<TextInput
  id="register-email"
  bind:value={register.email}
  error={!!error}
  {disabled}
  type="email"
  placeholder="e.g. aelia@retrixe.xyz"
/>
<label for="register-password">Password</label>
<TextInput
  id="register-password"
  bind:value={register.password}
  error={!!error}
  {disabled}
  type="password"
  onkeypress={e => e.key === 'Enter' && onRegister() /* eslint-disable-line */}
/>
{#if error === ''}
  <p class="result">Registered successfully! Wait for your account to be verified.</p>
{:else if !!error}
  <p class="result error">{error}</p>
{/if}
<br />
<Button {disabled} onclick={onRegister}>Sign Up</Button>
<br />
<p>Already have an account? <a href="/login">Log in</a></p>
