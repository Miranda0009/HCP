const assert = require('node:assert/strict');
const test = require('node:test');

const { formatCnpj, isValidCnpj, mapOffice, onlyDigits } = require('../js/cnpja.js');

test('normaliza, formata e valida o CNPJ', () => {
  assert.equal(onlyDigits('37.335.118/0001-80'), '37335118000180');
  assert.equal(formatCnpj('37335118000180'), '37.335.118/0001-80');
  assert.equal(isValidCnpj('37.335.118/0001-80'), true);
  assert.equal(isValidCnpj('11.111.111/1111-11'), false);
  assert.equal(isValidCnpj('37.335.118/0001-81'), false);
});

test('mapeia a resposta pública da CNPJá para os campos do HCP', () => {
  const office = mapOffice({
    taxId: 37335118000180,
    alias: 'Cnpja',
    company: { name: 'CNPJA TECNOLOGIA LTDA' },
    status: { text: 'Ativa' },
    address: { city: 'São Paulo', state: 'SP' },
    phones: [{ area: '11', number: '971564144' }],
    mainActivity: { text: 'Tratamento de dados' },
    updated: '2026-08-08T23:59:59.999Z'
  });

  assert.deepEqual(office, {
    cnpj: '37335118000180',
    companyName: 'CNPJA TECNOLOGIA LTDA',
    tradeName: 'Cnpja',
    status: 'Ativa',
    niche: 'Tratamento de dados',
    phone: '11971564144',
    location: 'São Paulo · SP',
    updatedAt: '2026-08-08T23:59:59.999Z'
  });
});

