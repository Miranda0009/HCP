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

  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({
        data: { session: window.location.pathname.endsWith('/login.html') ? null : { user } },
        error: null
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
    },
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({ data: profile, error: null })
              };
            }
          };
        }
      };
    }
  };

  window.supabase = { createClient: () => client };
})();
