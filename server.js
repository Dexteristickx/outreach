const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Paths to data
const dbPath = path.join(__dirname, 'data', 'database.json');
const gospelPath = path.join(__dirname, 'data', 'gospel_content.json');
const resourcesPath = path.join(__dirname, 'data', 'resources.json');
const emailsPath = path.join(__dirname, 'data', 'email_templates.json');

// Serverless / Vercel persistence fallback
let inMemoryDb = null;
const isVercel = Boolean(process.env.VERCEL);
const tmpDbPath = path.join('/tmp', 'database.json');

// Helper to read JSON
function readJson(filePath) {
  try {
    const target = (isVercel && filePath === dbPath && fs.existsSync(tmpDbPath)) ? tmpDbPath : filePath;
    if (fs.existsSync(target)) {
      const raw = fs.readFileSync(target, 'utf8');
      const parsed = JSON.parse(raw);
      if (filePath === dbPath) inMemoryDb = parsed;
      return parsed;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  if (filePath === dbPath && inMemoryDb) {
    return inMemoryDb;
  }
  return null;
}

// Helper to write JSON
function writeJson(filePath, data) {
  if (filePath === dbPath || filePath === tmpDbPath) {
    inMemoryDb = data;
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn(`Direct write to ${filePath} failed (serverless read-only filesystem):`, err.message);
    if (filePath === dbPath) {
      try {
        fs.writeFileSync(tmpDbPath, JSON.stringify(data, null, 2), 'utf8');
        return true;
      } catch (tmpErr) {
        console.error('Error writing to /tmp:', tmpErr.message);
      }
    }
    return true; // cached in inMemoryDb
  }
}

// Ensure database exists
if (!fs.existsSync(dbPath) && !isVercel) {
  const initialData = { decisions: [], prayers: [], stories: [], contacts: [], subscribers: [] };
  writeJson(dbPath, initialData);
}

// --- API ROUTES ---

// 1. Salvation Decision submission
app.post('/api/decision', (req, res) => {
  const { firstName, lastName, email, city, country, reachOut, notes } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ error: 'First name and email are required.' });
  }

  const db = readJson(dbPath) || { decisions: [] };
  const newDecision = {
    id: 'dec-' + Date.now(),
    firstName: String(firstName).trim(),
    lastName: String(lastName || '').trim(),
    email: String(email).trim().toLowerCase(),
    city: String(city || '').trim(),
    country: String(country || '').trim(),
    reachOut: Boolean(reachOut === true || reachOut === 'true' || reachOut === 'yes'),
    notes: String(notes || '').trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };

  db.decisions = db.decisions || [];
  db.decisions.unshift(newDecision);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Welcome to the family of God! Your decision has been joyfully recorded.',
    decisionId: newDecision.id,
    redirect: '/welcome.html'
  });
});

// 2. Get Prayers
app.get('/api/prayers', (req, res) => {
  const db = readJson(dbPath) || { prayers: [] };
  const publicPrayers = (db.prayers || []).filter(p => p.isPublic !== false);
  res.json({ prayers: publicPrayers });
});

// 3. Submit a Prayer Request
app.post('/api/prayers', (req, res) => {
  const { name, request, category, isPublic } = req.body;

  if (!request || request.trim().length < 5) {
    return res.status(400).json({ error: 'Please enter a sincere prayer request (at least 5 characters).' });
  }

  const db = readJson(dbPath) || { prayers: [] };
  const newPrayer = {
    id: 'pry-' + Date.now(),
    name: name && name.trim() ? name.trim() : 'Anonymous',
    request: request.trim(),
    category: category || 'General',
    isPublic: isPublic !== false && isPublic !== 'false',
    prayCount: 1,
    createdAt: new Date().toISOString()
  };

  db.prayers = db.prayers || [];
  db.prayers.unshift(newPrayer);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Your prayer request has been received with love. We are standing with you.',
    prayer: newPrayer
  });
});

// 4. Pray for a request (Increment counter)
app.post('/api/prayers/:id/pray', (req, res) => {
  const { id } = req.params;
  const db = readJson(dbPath);

  if (!db || !db.prayers) {
    return res.status(404).json({ error: 'Database not found' });
  }

  const prayer = db.prayers.find(p => p.id === id);
  if (!prayer) {
    return res.status(404).json({ error: 'Prayer request not found' });
  }

  prayer.prayCount = (prayer.prayCount || 0) + 1;
  writeJson(dbPath, db);

  res.json({ success: true, prayCount: prayer.prayCount });
});

// 5. Testimonies / Stories
app.get('/api/stories', (req, res) => {
  const db = readJson(dbPath) || { stories: [] };
  const { category } = req.query;
  let list = db.stories || [];
  if (category && category !== 'All') {
    list = list.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
  }
  res.json({ stories: list });
});

app.post('/api/stories', (req, res) => {
  const { title, author, category, story, videoUrl } = req.body;
  if (!title || !story) {
    return res.status(400).json({ error: 'Title and story text are required.' });
  }

  const db = readJson(dbPath) || { stories: [] };
  const newStory = {
    id: 'sto-' + Date.now(),
    title: title.trim(),
    author: author && author.trim() ? author.trim() : 'Anonymous',
    category: category || 'Faith & Life',
    type: videoUrl && videoUrl.trim() ? 'video' : 'written',
    excerpt: story.trim().substring(0, 160) + '...',
    fullStory: story.trim(),
    videoUrl: videoUrl ? videoUrl.trim() : '',
    readTime: '4 min read',
    date: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  };

  db.stories = db.stories || [];
  db.stories.unshift(newStory);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Thank you for sharing what God has done! Your story brings hope to others.',
    story: newStory
  });
});

// 6. Gospel Content
app.get('/api/gospel', (req, res) => {
  const data = readJson(gospelPath);
  if (!data) return res.status(500).json({ error: 'Gospel content unavailable' });
  res.json(data);
});

// 7. Resources (Topical guides, Bible reading, daily prayer)
app.get('/api/resources', (req, res) => {
  const data = readJson(resourcesPath);
  if (!data) return res.status(500).json({ error: 'Resources unavailable' });
  res.json(data);
});

// 8. Contact Form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const db = readJson(dbPath) || { contacts: [] };
  const newContact = {
    id: 'cnt-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    subject: subject ? subject.trim() : 'General Inquiry',
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  db.contacts = db.contacts || [];
  db.contacts.unshift(newContact);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Your message has been received. Our outreach team will reply within 24 hours.'
  });
});

// 9. Newsletter Signup
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const db = readJson(dbPath) || { subscribers: [] };
  db.subscribers = db.subscribers || [];

  const existing = db.subscribers.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
  if (!existing) {
    db.subscribers.push({
      id: 'sub-' + Date.now(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    });
    writeJson(dbPath, db);
  }

  res.status(201).json({
    success: true,
    message: 'Bless you! You are subscribed to our weekly devotionals and ministry updates.'
  });
});

// 10. Global Site Search
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (!q || q.length < 2) {
    return res.json({ results: [] });
  }

  const results = [];
  const gospel = readJson(gospelPath) || {};
  const resources = readJson(resourcesPath) || {};
  const db = readJson(dbPath) || {};

  // Search Gospel steps
  if (gospel.planOfSalvation) {
    gospel.planOfSalvation.forEach(step => {
      if (
        step.title.toLowerCase().includes(q) ||
        step.summary.toLowerCase().includes(q) ||
        step.explanation.toLowerCase().includes(q) ||
        step.scripture.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Gospel Step',
          title: `Step ${step.step}: ${step.title}`,
          snippet: step.summary,
          url: `/gospel.html#step-${step.step}`
        });
      }
    });
  }

  // Search Doubts / FAQs
  if (gospel.doubtsAndFaqs) {
    gospel.doubtsAndFaqs.forEach(faq => {
      if (faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)) {
        results.push({
          type: 'Question & Doubt',
          title: faq.question,
          snippet: faq.answer.substring(0, 140) + '...',
          url: '/gospel.html#doubts'
        });
      }
    });
  }

  // Search Topical Guides
  if (resources.topicalGuides) {
    resources.topicalGuides.forEach(guide => {
      if (
        guide.topic.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.biblicalTruth.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Topical Guide',
          title: guide.topic,
          snippet: guide.summary,
          url: `/resources.html#${guide.id}`
        });
      }
    });
  }

  // Search Testimonies
  if (db.stories) {
    db.stories.forEach(story => {
      if (
        story.title.toLowerCase().includes(q) ||
        story.fullStory.toLowerCase().includes(q) ||
        story.author.toLowerCase().includes(q)
      ) {
        results.push({
          type: 'Testimony',
          title: story.title,
          snippet: story.excerpt,
          url: `/stories.html#${story.id}`
        });
      }
    });
  }

  res.json({ query: q, total: results.length, results: results.slice(0, 8) });
});

// 11. Outreach Invitation Submission
app.post('/api/outreach/invite', (req, res) => {
  const organization = req.body.organization || req.body.hostName || '';
  const contactName = req.body.contactName || req.body.contactPerson || req.body.fullName || '';
  const { email, phone, city, country, eventType, expectedAudience, desiredDate, notes } = req.body;
  if (!organization || !contactName || !email || !city) {
    return res.status(400).json({ error: 'Organization, contact name, email, and city are required.' });
  }

  const db = readJson(dbPath) || {};
  db.outreachInvitations = db.outreachInvitations || [];
  const newInvite = {
    id: 'inv-' + Date.now(),
    organization: organization.trim(),
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    city: city.trim(),
    country: (country || '').trim(),
    eventType: eventType || 'Community Crusade',
    expectedAudience: expectedAudience || 'Not specified',
    desiredDate: desiredDate || 'Flexible',
    notes: (notes || '').trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };

  db.outreachInvitations.unshift(newInvite);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Thank you for inviting our outreach team! Our missions director will review your request and contact you within 48 hours.',
    invitation: newInvite
  });
});

// 12. Missionary Training Enrollment
app.post('/api/training/enroll', (req, res) => {
  const { fullName, email, phone, city, country, calling, cohort } = req.body;
  if (!fullName || !email || !calling) {
    return res.status(400).json({ error: 'Full name, email, and brief calling/testimony are required.' });
  }

  const db = readJson(dbPath) || {};
  db.trainingApplications = db.trainingApplications || [];
  const newApplication = {
    id: 'trn-' + Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    city: (city || '').trim(),
    country: (country || '').trim(),
    calling: calling.trim(),
    cohort: cohort || 'Next Upcoming Cohort',
    status: 'Under Review',
    createdAt: new Date().toISOString()
  };

  db.trainingApplications.unshift(newApplication);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Your application to the School of Evangelism has been received! Check your email for syllabus details and next steps.',
    application: newApplication
  });
});

// 13. Ministry Membership Registration
app.post('/api/membership', (req, res) => {
  const { fullName, email, city, country, involvement, testimony } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required to join membership.' });
  }

  const db = readJson(dbPath) || {};
  db.memberships = db.memberships || [];
  const newMember = {
    id: 'mem-' + Date.now(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    city: (city || '').trim(),
    country: (country || '').trim(),
    involvement: involvement || 'General Community Member',
    testimony: (testimony || '').trim(),
    status: 'Active Member',
    createdAt: new Date().toISOString()
  };

  db.memberships.unshift(newMember);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Welcome to the family! You are now officially enrolled in our global ministry membership community.',
    member: newMember
  });
});

// 14. Kingdom Partnership Pledge
app.post('/api/partner', (req, res) => {
  const { partnerName, email, tier, amount, frequency, notes } = req.body;
  if (!partnerName || !email || !amount) {
    return res.status(400).json({ error: 'Partner name, email, and pledge amount are required.' });
  }

  const db = readJson(dbPath) || {};
  db.partnerships = db.partnerships || [];
  const newPartner = {
    id: 'prt-' + Date.now(),
    partnerName: partnerName.trim(),
    email: email.trim().toLowerCase(),
    tier: tier || 'Kingdom Partner',
    amount: amount.trim(),
    frequency: frequency || 'Monthly Recurring',
    notes: (notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  db.partnerships.unshift(newPartner);
  writeJson(dbPath, db);

  res.status(201).json({
    success: true,
    message: 'Thank you for partnering with the harvest! May the Lord multiply your seed sown for His Kingdom.',
    partner: newPartner
  });
});

// 15. Admin Overview
app.get('/api/admin/overview', (req, res) => {
  const db = readJson(dbPath) || {};
  const emails = readJson(emailsPath) || { dripSeries: [] };

  const decisions = db.decisions || [];
  const prayers = db.prayers || [];
  const stories = db.stories || [];
  const subscribers = db.subscribers || [];
  const outreachInvitations = db.outreachInvitations || [];
  const trainingApplications = db.trainingApplications || [];
  const memberships = db.memberships || [];
  const partnerships = db.partnerships || [];

  const needFollowUp = decisions.filter(d => d.reachOut && d.status === 'New').length;

  res.json({
    counts: {
      totalDecisions: decisions.length,
      needFollowUp,
      totalPrayers: prayers.length,
      totalStories: stories.length,
      totalSubscribers: subscribers.length,
      totalOutreachInvites: outreachInvitations.length,
      totalTrainees: trainingApplications.length,
      totalMembers: memberships.length,
      totalPartners: partnerships.length
    },
    decisions,
    prayers,
    stories,
    outreachInvitations,
    trainingApplications,
    memberships,
    partnerships,
    dripSeries: emails.dripSeries
  });
});

// 12. Update Decision status (Admin)
app.patch('/api/admin/decisions/:id', (req, res) => {
  const { id } = req.params;
  const { status, counselorNotes } = req.body;
  const db = readJson(dbPath);

  if (!db || !db.decisions) {
    return res.status(404).json({ error: 'Not found' });
  }

  const dec = db.decisions.find(d => d.id === id);
  if (!dec) {
    return res.status(404).json({ error: 'Decision not found' });
  }

  if (status) dec.status = status;
  if (counselorNotes !== undefined) dec.counselorNotes = counselorNotes;
  dec.updatedAt = new Date().toISOString();

  writeJson(dbPath, db);
  res.json({ success: true, decision: dec });
});

// 13. Test/Simulate Drip Email (Admin)
app.post('/api/admin/test-drip-email', (req, res) => {
  const { email, day } = req.body;
  const templates = readJson(emailsPath) || { dripSeries: [] };
  const template = templates.dripSeries.find(t => t.day === parseInt(day, 10));

  if (!template) {
    return res.status(404).json({ error: 'Email template for specified day not found' });
  }

  res.json({
    success: true,
    simulated: true,
    recipient: email || 'seeker@example.com',
    day: template.day,
    subject: template.subject,
    preview: template.preview,
    dispatchedAt: new Date().toISOString()
  });
});

// Clean URL routing fallback
app.get('*', (req, res) => {
  const cleanPath = req.path.replace(/\/$/, '');
  const potentialHtml = path.join(publicDir, `${cleanPath}.html`);

  if (fs.existsSync(potentialHtml)) {
    return res.sendFile(potentialHtml);
  }

  const defaultHtml = path.join(publicDir, req.path);
  if (fs.existsSync(defaultHtml) && fs.statSync(defaultHtml).isFile()) {
    return res.sendFile(defaultHtml);
  }

  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

// Export app for serverless platforms (e.g. Vercel)
module.exports = app;

// Start Server if run directly
if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Evangelism Outreach Platform running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Mode: Warm Minimalism (Faith, Hope, Love)`);
    console.log(`====================================================`);
  });
}
