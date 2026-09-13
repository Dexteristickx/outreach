// Discipleship Hub - 30-Day Bible Tracker, ACTS Prayer Guide, Downloadable Guide Generator
document.addEventListener('DOMContentLoaded', async () => {
  const planGrid = document.getElementById('bible-plan-grid');
  const progressBarFill = document.getElementById('bible-progress-fill');
  const progressText = document.getElementById('bible-progress-text');
  const downloadGuideBtn = document.getElementById('download-guide-btn');

  // Load completed days from localStorage
  function getCompletedDays() {
    try {
      return JSON.parse(localStorage.getItem('outreach_bible_completed') || '[]');
    } catch (e) {
      return [];
    }
  }

  function setCompletedDays(days) {
    localStorage.setItem('outreach_bible_completed', JSON.stringify(days));
    updateProgress(days.length);
  }

  function updateProgress(completedCount) {
    const total = 30;
    const percentage = Math.round((completedCount / total) * 100);
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    if (progressText) progressText.innerText = `${completedCount} of ${total} days completed (${percentage}%)`;
  }

  // Fetch plan and render
  if (planGrid) {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      const plan = data.bibleReadingPlan || [];
      const completedDays = getCompletedDays();

      updateProgress(completedDays.length);

      planGrid.innerHTML = plan.map(item => {
        const isDone = completedDays.includes(item.day);
        return `
          <div class="reading-day-card ${isDone ? 'completed' : ''}" data-day="${item.day}">
            <input type="checkbox" class="reading-checkbox" ${isDone ? 'checked' : ''} aria-label="Mark Day ${item.day} as read">
            <div style="flex-grow:1;">
              <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--color-accent);">Day ${item.day}</div>
              <div style="font-family:var(--font-serif); font-weight:600; font-size:1.05rem; margin:0.15rem 0;">${item.book} ${item.chapter}</div>
              <div style="font-size:0.8rem; color:var(--color-text-secondary); line-height:1.4;">${item.theme}</div>
            </div>
          </div>
        `;
      }).join('');

      // Event listener on cards & checkboxes
      planGrid.querySelectorAll('.reading-day-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const day = parseInt(card.getAttribute('data-day'), 10);
          const checkbox = card.querySelector('.reading-checkbox');

          if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
          }

          let current = getCompletedDays();
          if (checkbox.checked) {
            if (!current.includes(day)) current.push(day);
            card.classList.add('completed');
          } else {
            current = current.filter(d => d !== day);
            card.classList.remove('completed');
          }

          setCompletedDays(current);
        });
      });
    } catch (err) {
      planGrid.innerHTML = '<p style="color:var(--color-danger); text-align:center;">Failed to load Bible Reading Plan.</p>';
    }
  }

  // ACTS Interactive Prayer Stepper
  const actsSteps = document.querySelectorAll('.acts-step-btn');
  const actsPanels = document.querySelectorAll('.acts-panel');
  if (actsSteps.length > 0) {
    actsSteps.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-step');
        actsSteps.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        actsPanels.forEach(p => {
          if (p.id === `acts-${target}`) {
            p.style.display = 'block';
          } else {
            p.style.display = 'none';
          }
        });
      });
    });
  }

  // 7-Day New Believer Guide Printable Window / Generator
  if (downloadGuideBtn) {
    downloadGuideBtn.addEventListener('click', () => {
      const seekerName = localStorage.getItem('outreach_seeker_name') || 'Beloved Child of God';
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Please allow popups to view the printable guide.', 'error');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>7-Day Walk with Jesus - Starter Guide</title>
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.7; color: #1A1A1A; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { color: #2E6B4F; font-size: 28px; text-align: center; margin-bottom: 5px; }
            .subhead { text-align: center; color: #737373; font-size: 15px; margin-bottom: 30px; }
            .day-card { border-bottom: 1px solid #E8E5DD; padding: 20px 0; }
            .day-title { color: #2E6B4F; font-weight: bold; font-size: 18px; }
            .verse { background: #FBF7F0; border-left: 3px solid #B8860B; padding: 10px 15px; margin: 10px 0; font-style: italic; }
            .prayer { background: #EBF3EE; padding: 10px 15px; border-radius: 6px; margin-top: 8px; font-size: 14px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align:right; margin-bottom:20px;">
            <button onclick="window.print()" style="background:#2E6B4F; color:#FFF; border:none; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Print / Save as PDF</button>
          </div>
          <h1>7-Day Walk with Jesus</h1>
          <div class="subhead">A Guided First-Week Discipleship Journal for ${seekerName}</div>

          <div class="day-card">
            <div class="day-title">Day 1: Welcome to the Family</div>
            <div class="verse">"If anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." (2 Corinthians 5:17)</div>
            <p><strong>Reflection:</strong> Your identity is no longer defined by what you've done wrong, but by what Jesus did right. You are clean, accepted, and secure in Him.</p>
            <div class="prayer"><strong>Prayer:</strong> "Lord Jesus, thank You for taking my sins upon the Cross. Today I step into Your freedom."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 2: Learning to Talk with God</div>
            <div class="verse">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." (Philippians 4:6)</div>
            <p><strong>Reflection:</strong> Prayer isn't a performance; it is honest fellowship. Speak to God with the natural openness you would have with a trusted friend.</p>
            <div class="prayer"><strong>Prayer:</strong> "Father, quiet the noise in my mind. Teach me to hear Your voice and rest in Your peace."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 3: Opening the Scriptures</div>
            <div class="verse">"Your word is a lamp for my feet, a light on my path." (Psalm 119:105)</div>
            <p><strong>Reflection:</strong> The Bible isn't an ancient rulebook; it is a living revelation of God's character. Read John chapter 1 today.</p>
            <div class="prayer"><strong>Prayer:</strong> "Holy Spirit, breathe on the pages of Scripture as I read. Illuminate truth to my heart."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 4: Freedom from Guilt & Shame</div>
            <div class="verse">"There is therefore now no condemnation for those who are in Christ Jesus." (Romans 8:1)</div>
            <p><strong>Reflection:</strong> When old regrets whisper lies about your worth, remember that Jesus paid the full debt in blood. You are wholly forgiven.</p>
            <div class="prayer"><strong>Prayer:</strong> "Jesus, whenever shame tries to define me, remind me of the Cross where my penalty was paid."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 5: Finding Your Spiritual Family</div>
            <div class="verse">"Let us consider how we may spur one another on toward love and good deeds, not giving up meeting together." (Hebrews 10:24-25)</div>
            <p><strong>Reflection:</strong> Embers glow hotter together. Find a local, loving Bible-believing church to grow with.</p>
            <div class="prayer"><strong>Prayer:</strong> "Lord, lead me to authentic brothers and sisters who will encourage me on this faith journey."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 6: Sharing the Hope Inside You</div>
            <div class="verse">"Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect." (1 Peter 3:15)</div>
            <p><strong>Reflection:</strong> You don't need all the answers to tell someone that Jesus gave you peace. Simply share your story.</p>
            <div class="prayer"><strong>Prayer:</strong> "Lord, give me eyes of love for my family and friends. Use my life as a light of Your grace."</div>
          </div>

          <div class="day-card">
            <div class="day-title">Day 7: Abiding in His Presence</div>
            <div class="verse">"I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing." (John 15:5)</div>
            <p><strong>Reflection:</strong> Christianity is not striving to earn God's favor; it is abiding in the favor He already gave you.</p>
            <div class="prayer"><strong>Prayer:</strong> "Jesus, You are my life, my joy, and my hope. Keep me close to Your heart forever. Amen."</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }
});
