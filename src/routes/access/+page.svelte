<script lang="ts">
  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<main class="gate">
  <div class="card">
    <img class="mark" src="/img/eros-icon.png" alt="" width="72" height="72" />
    <h1>Eros Vector</h1>
    <p class="lede">
      {#if data.upgradingBackstage}
        Enter a readonly or developer password to access backstage.
      {:else}
        Invite-only access. <br />Enter the password you were given.
      {/if}
    </p>

    {#if !data.configured}
      <p class="error" role="alert">
        Access passwords are not configured. Set
        <code>ACCESS_PASSWORD_VIEWER</code>,
        <code>ACCESS_PASSWORD_READONLY</code>,
        <code>ACCESS_PASSWORD_DEVELOPER</code>, and
        <code>ACCESS_COOKIE_SECRET</code> on the server.
      </p>
    {:else}
      <form method="POST" action="?/login" class="form">
        <input type="hidden" name="next" value={form?.next ?? data.next} />
        <label class="field">
          <span class="label">Password</span>
          {#if data.upgradingBackstage}
            <input
              type="password"
              name="password"
              autocomplete="current-password"
              required
            />
          {:else}
            <input
              type="text"
              name="password"
              autocomplete="off"
              spellcheck="false"
              autocapitalize="off"
              required
            />
          {/if}
        </label>
        {#if form?.error}
          <p class="error" role="alert">{form.error}</p>
        {/if}
        <button type="submit" class="submit">Enter</button>
      </form>
    {/if}

    <!-- <p class="note">Nothing is stored on our servers. Your survey data stays in your browser.</p> -->
  </div>
</main>

<style>
  .gate {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.25rem;
    color: var(--cream);
    background: radial-gradient(
        ellipse 70% 55% at 50% -5%,
        rgba(158, 121, 130, 0.28),
        transparent 60%
      ),
      var(--navy);
  }

  .card {
    width: min(100%, 22rem);
    text-align: center;
  }

  .mark {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin-bottom: 0.75rem;
  }

  h1 {
    margin: 0;
    font-family: "Fraunces", Georgia, serif;
    font-size: 1.85rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .lede {
    margin: 0.65rem 0 1.5rem;
    font-size: 0.95rem;
    line-height: 1.45;
    color: color-mix(in srgb, var(--cream) 78%, transparent);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    text-align: left;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .label {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--cream) 65%, transparent);
  }

  input[type="text"],
  input[type="password"] {
    width: 100%;
    padding: 0.7rem 0.85rem;
    border: 1px solid rgba(249, 246, 229, 0.22);
    border-radius: 8px;
    background: rgba(249, 246, 229, 0.06);
    color: var(--cream);
    font-size: 1rem;
  }

  input[type="text"]:focus,
  input[type="password"]:focus {
    outline: 2px solid color-mix(in srgb, var(--rose) 55%, transparent);
    border-color: var(--rose);
  }

  .submit {
    margin-top: 0.25rem;
    padding: 0.8rem 1.25rem;
    min-height: 2.75rem;
    border: none;
    border-radius: 8px;
    background: var(--cream);
    color: var(--navy);
    font-weight: 600;
    cursor: pointer;
  }

  .submit:hover {
    background: #fff;
  }

  .error {
    margin: 0;
    padding: 0.65rem 0.75rem;
    border-radius: 8px;
    background: rgba(163, 59, 59, 0.25);
    color: #f2c4c4;
    font-size: 0.88rem;
    line-height: 1.4;
    text-align: left;
  }

  .error code {
    font-size: 0.78rem;
    word-break: break-all;
  }

  .note {
    margin: 1.5rem 0 0;
    font-size: 0.78rem;
    line-height: 1.4;
    color: color-mix(in srgb, var(--cream) 55%, transparent);
  }
</style>
