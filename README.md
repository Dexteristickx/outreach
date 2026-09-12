# Anchor of Hope — Evangelism Outreach Platform

An outreach evangelism web platform engineered according to the **Warm Minimalism** design philosophy. Designed to remove religious barriers, lead seekers through a gentle and unhurried salvation journey, nurture new believers with practical discipleship tools, provide community prayer intercession, equip missionaries, host citywide crusades, and support ministry follow-up teams.

---

## 🌟 Warm Minimalism Design Philosophy

- **The Message is the Hero:** Clean, uncluttered UI allows the Gospel of grace to breathe.
- **Warm Whitespace:** Paired with soft neutrals (`#FAFAF8`, `#F5E6D3`), rich growth green (`#2E6B4F`), and warm gold (`#B8860B`).
- **Modern Typography:** Editorial serif headings (*Playfair Display* / *Lora*) combined with high-readability sans-serif body (*Inter* / *DM Sans*) with 1.6–1.8 line-height.
- **Invitational, Jargon-Free Tone:** No Christianese or moralistic lecturing. Every page radiates hope, honesty, and hospitality.

---

## 🧭 Navigation Architecture: 5 Focused Pillars

1. **The Gospel**
   - Who Is Jesus? & Why It Matters
   - 5-Step Biblical Plan of Salvation
   - Common Doubts & FAQs (Apologetics)
   - Direct CTA: *Accept Jesus Today*
2. **Discipleship**
   - New Believers Hub (First Steps)
   - How to Pray (ACTS Interactive Model)
   - 30-Day Beginner Bible Reading Plan
   - Real Stories & Testimonies
   - Topical Care Guides (Anxiety, Purpose, Grief)
3. **Missions & Training**
   - Upcoming Crusades & Outreach Schedule
   - **Invite Us to Your City / Campus** (Outreach Invitation Form)
   - **School of Evangelism** (Missionary Curriculum & Enrollment)
4. **Community & Prayer**
   - Community Prayer Wall & Live Intercession
   - Submit Confidential or Public Prayer Requests
   - **Ministry Membership** (Covenant Spiritual Family)
5. **Partner & About**
   - **Kingdom Partnership & Giving** (Seed, Harvest & Sponsor Tiers)
   - Volunteer Opportunities & Digital Evangelism Toolkit
   - Statement of Faith (Historic Orthodoxy) & Leadership Team
   - Pastoral Care & Crisis Support

---

## 📁 Architecture & Key Hubs

```
evangelism-outreach/
├── server.js                   # Node.js Express server & REST API
├── package.json                # Dependencies and scripts
├── .gitignore                  # Git ignore rules
├── README.md                   # Complete documentation
├── data/
│   ├── database.json           # JSON store: decisions, prayers, stories, invites, trainees, members, partners
│   ├── gospel_content.json     # Curated 5-step Gospel plan, Christology, Doubts FAQs
│   ├── resources.json          # Topical guides (anxiety, grief, purpose), 30-day Bible tracker
│   └── email_templates.json    # Complete 7-day automated salvation welcome drip email series
└── public/
    ├── css/
    │   ├── variables.css       # Design tokens (colors, fonts, radii, spacing)
    │   ├── style.css           # Global typography, layout reset, buttons
    │   └── components.css      # Hero, dropdowns, prayer cards, decision box, live chat
    ├── js/
    │   ├── main.js             # Dropdown menus, drawer accordion, search modal (Ctrl+K), toast notifications
    │   ├── gospel.js           # Doubts accordion & salvation decision triggers
    │   ├── prayer.js           # Community prayer wall & real-time counter increment
    │   ├── discipleship.js     # 30-day Bible tracker (localStorage) & printable guide generator
    │   ├── chat.js             # Floating pastoral counselor interactive live chat
    │   └── admin.js            # Ministry console: 7 KPIs, data tables, and drip email simulator
    ├── index.html              # Homepage with hero, short intro, featured story, pathway cards
    ├── gospel.html             # The Gospel core hub (Who Is Jesus, 5 Steps, Doubts FAQ)
    ├── decision.html           # Decision page with sinner's prayer and decision capture form
    ├── welcome.html            # Immediate post-decision celebration & Day 1 checklist
    ├── new-believers.html      # Discipleship hub (ACTS prayer guide, 30-day Bible plan, church tips)
    ├── stories.html            # Written and video testimonies with filter and story submission
    ├── prayer.html             # Community prayer wall & prayer submission form
    ├── outreach.html           # 2026 Crusade schedule & "Invite Us to Your City" form
    ├── training.html           # School of Evangelism 4-module curriculum & application form
    ├── membership.html         # Ministry Membership covenant & registration form
    ├── partner.html            # Kingdom Partnership vision, impact tiers, and pledge form
    ├── resources.html          # Topical guides for anxiety, grief, purpose, and wallpapers
    ├── about.html              # Mission, Statement of Faith, and pastoral team
    ├── get-involved.html       # Volunteer info & "Share the Gospel" digital toolkit
    ├── contact.html            # Pastoral contact form, crisis hotlines, live chat trigger
    ├── admin.html              # Ministry follow-up dashboard & 7 KPI data tables
    └── 404.html                # Hope-filled 404 page
```

---

## 🚀 How to Run Locally

1. Clone or open the repository:
   ```bash
   git clone https://github.com/Dexteristickx/outreach.git
   cd outreach
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/decision` | `POST` | Records a salvation decision and queues the 7-day welcome drip |
| `/api/prayers` | `GET` | Fetches public prayer requests |
| `/api/prayers` | `POST` | Submits a new prayer request (public or private) |
| `/api/prayers/:id/pray` | `POST` | Atomically increments the "People praying for this" counter |
| `/api/outreach/invite` | `POST` | Submits a request to host an evangelistic crusade or campus mission |
| `/api/training/enroll` | `POST` | Submits an application to the School of Evangelism |
| `/api/membership` | `POST` | Enrolls a believer into the global ministry covenant membership |
| `/api/partner` | `POST` | Submits a financial / prayer partnership pledge (Seed, Harvest, Sponsor) |
| `/api/stories` | `GET` | Fetches testimonies (supports `?category=...` query) |
| `/api/stories` | `POST` | Submits a new community testimony |
| `/api/resources` | `GET` | Returns topical guides, Bible reading plan, and daily prayer points |
| `/api/gospel` | `GET` | Returns Gospel steps, historical data, and FAQs |
| `/api/contact` | `POST` | Submits a general or pastoral contact message |
| `/api/newsletter` | `POST` | Subscribes an email to the weekly devotional list |
| `/api/search?q=...` | `GET` | Real-time global search across Gospel topics, FAQs, and guides |
| `/api/admin/overview` | `GET` | Admin KPI metrics and all live submission tables |
| `/api/admin/decisions/:id` | `PATCH` | Updates pastoral follow-up status |
| `/api/admin/test-drip-email` | `POST` | Simulates dispatching a day from the 7-day welcome drip sequence |

---

## 🛡️ Follow-Up & Ministry Care Flow

1. **Seeker Encounter:** The seeker reads the 5-step Gospel presentation or interacts with the pastoral chat.
2. **Decision Made:** On `/decision.html`, the seeker prays the prayer of surrender, clicks "I Prayed This Today", and submits their name, email, and location.
3. **Instant Celebration:** Redirects to `/welcome.html` ("Welcome to the Family of God") with their first 24-hour guidance.
4. **Automated Nurture:** The system activates the 7-day welcome email sequence (Day 1: Welcome, Day 2: Prayer, Day 3: The Bible, Day 4: Overcoming Doubt, Day 5: Finding Church, Day 6: Sharing, Day 7: Abiding in Grace).
5. **Community Integration:** Believers are connected to local churches, the 30-day Bible reading tracker, the School of Evangelism, and the Ministry Membership covenant family.
