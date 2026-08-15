-- As políticas RLS chamam este helper privado durante consultas autenticadas.
-- Ele não está exposto pela Data API e retorna apenas um booleano calculado
-- a partir de auth.uid(); a permissão é necessária para a expressão da policy.
grant execute on function private.is_account_member(uuid) to authenticated;
