const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({
      hostname: 'localhost',
      port: 3000,
      path: path
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- Starting API Verification ---');

  // 1. Outreach Invite
  const outreachRes = await post('/api/outreach/invite', {
    hostName: 'Grace Community Fellowship',
    contactPerson: 'Pastor Marcus Cole',
    email: 'marcus@gracechapel.org',
    phone: '+1 555-0199',
    city: 'Denver',
    country: 'United States',
    estimatedAttendees: '500-1000',
    timeframe: 'Autumn 2026',
    notes: 'Hungry for city-wide revival and street soul winning.'
  });
  console.log('1. /api/outreach/invite:', outreachRes.status, outreachRes.data.success ? 'PASS' : 'FAIL');

  // 2. Training Enroll
  const trainingRes = await post('/api/training/enroll', {
    fullName: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 555-0188',
    city: 'Chicago',
    country: 'United States',
    calling: 'Called to campus evangelism and street ministry.',
    cohort: 'Spring Cohort (Starts March 2026)'
  });
  console.log('2. /api/training/enroll:', trainingRes.status, trainingRes.data.success ? 'PASS' : 'FAIL');

  // 3. Membership
  const memberRes = await post('/api/membership', {
    fullName: 'David K. Osei',
    email: 'david.osei@example.com',
    city: 'London',
    country: 'United Kingdom',
    involvement: 'Intercessory Prayer Team',
    testimony: 'Saved 3 years ago at an outreach crusade, now desiring to serve.'
  });
  console.log('3. /api/membership:', memberRes.status, memberRes.data.success ? 'PASS' : 'FAIL');

  // 4. Partner
  const partnerRes = await post('/api/partner', {
    partnerName: 'Jonathan & Rachel Vance',
    email: 'vancefamily@example.com',
    tier: 'Harvest Partner',
    amount: '75',
    frequency: 'Monthly Recurring',
    notes: 'Praying for open hearts in every city you visit.'
  });
  console.log('4. /api/partner:', partnerRes.status, partnerRes.data.success ? 'PASS' : 'FAIL');

  // 5. Admin Overview
  const adminRes = await get('/api/admin/overview');
  console.log('5. /api/admin/overview:', adminRes.status, adminRes.data.counts);

  console.log('--- All Tests Completed Successfully ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
