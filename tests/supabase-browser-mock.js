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
  let clientFocus = null;

  const client = {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({
        data: { session: window.location.pathname.endsWith('/login.html') ? null : { user } },
        error: null
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
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
        return {
          select: async () => ({ data: [], error: null })
        };
      }

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
