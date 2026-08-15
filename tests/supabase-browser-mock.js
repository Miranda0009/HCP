(() => {
  const user = {
    id: 'mobile-preview-user',
    email: 'preview@hcp.test',
    user_metadata: { full_name: 'JM - Marketing' }
  };

  const profile = {
    full_name: 'JM - Marketing',
    avatar_url: null,
    company_name: 'Conta HCP',
    phone: null
  };
  const account = {
    id: 'mobile-preview-account',
    owner_user_id: user.id,
    company_name: 'JM - Marketing',
    phone: '(11) 99999-9999',
    company_niche: 'Agência de marketing B2B',
    expected_user_count: 4
  };
  let clientFocus = null;
  let tokenBalance = 1025;

  function queryResult(value) {
    const builder = {
      select() { return builder; },
      update() { return builder; },
      eq() { return builder; },
      order() { return builder; },
      limit() { return builder; },
      maybeSingle: async () => ({ data: Array.isArray(value) ? (value[0] || null) : value, error: null }),
      then(resolve, reject) {
        return Promise.resolve({ data: value, error: null }).then(resolve, reject);
      }
    };
    return builder;
  }

  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({
        data: { session: window.location.pathname.endsWith('/login.html') ? null : { user } },
        error: null
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      updateUser: async () => ({ data: { user }, error: null })
    },
    from(table) {
      if (table === 'client_focus_profiles') {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: clientFocus, error: null })
                };
              }
            };
          },
          upsert: async (payload) => {
            clientFocus = { ...payload };
            return { data: clientFocus, error: null };
          }
        };
      }

      if (table === 'lead_source_feedback') {
        return queryResult([]);
      }

      if (table === 'profiles') return queryResult(profile);
      if (table === 'accounts') return queryResult(account);
      if (table === 'account_memberships') {
        return queryResult([{ account_id: account.id, role: 'owner', created_at: '2026-08-01T12:00:00Z' }]);
      }
      if (table === 'monthly_exchange_usage') return queryResult({ used_count: 1 });
      if (table === 'token_ledger') return queryResult([{ amount: 25 }]);
      return queryResult([]);
    },
    rpc: async (name, parameters = {}) => {
      if (name === 'hcp_get_token_balance') {
        return { data: [{ account_id: account.id, token_balance: tokenBalance }], error: null };
      }
      if (name === 'hcp_consume_lead_credits') {
        const quantity = Number(parameters.p_quantity || 0);
        if (quantity > tokenBalance) {
          return { data: null, error: { message: 'insufficient_lead_credits' } };
        }
        tokenBalance -= quantity;
        return {
          data: [{ debit_id: 1, credits_consumed: quantity, token_balance: tokenBalance }],
          error: null
        };
      }
      return {
        data: [{
          feedback_id: 'mobile-preview-feedback',
          tokens_awarded: 25,
          exchanges_used: 2,
          exchanges_remaining: 1,
          next_renewal: '2026-09-01',
          token_balance: 50
        }],
        error: null
      };
    }
  };

  window.supabase = { createClient: () => client };
})();
