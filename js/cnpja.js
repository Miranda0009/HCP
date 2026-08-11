(function exposeCnpjaUtilities(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.HCPCnpja = api;
})(typeof window !== 'undefined' ? window : globalThis, function createCnpjaUtilities() {
  const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

  function formatCnpj(value) {
    const digits = onlyDigits(value).slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  function isValidCnpj(value) {
    const digits = onlyDigits(value);
    if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

    const calculateDigit = (base, weights) => {
      const total = base.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
      const remainder = total % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };

    const first = calculateDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = calculateDigit(digits.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return digits.endsWith(`${first}${second}`);
  }

  function mapOffice(data = {}) {
    const firstPhone = Array.isArray(data.phones) ? data.phones[0] : null;
    const phoneDigits = firstPhone ? `${firstPhone.area || ''}${firstPhone.number || ''}` : '';
    const location = [data.address?.city, data.address?.state].filter(Boolean).join(' · ');

    return {
      cnpj: onlyDigits(data.taxId).padStart(14, '0').slice(-14),
      companyName: String(data.company?.name || data.alias || '').trim(),
      tradeName: String(data.alias || '').trim(),
      status: String(data.status?.text || '').trim(),
      niche: String(data.mainActivity?.text || '').trim(),
      phone: phoneDigits,
      location,
      updatedAt: String(data.updated || '').trim()
    };
  }

  return { onlyDigits, formatCnpj, isValidCnpj, mapOffice };
});

