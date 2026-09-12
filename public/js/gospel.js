// Gospel & Decision Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
  // 1. Accordion for Doubts & FAQs
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');
  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');

      // Close other open items
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });

      if (!isOpen) {
        item.classList.add('open');
      } else {
        item.classList.remove('open');
      }
    });
  });

  // 2. Decision Page Form Submission
  const decisionForm = document.getElementById('decision-form');
  if (decisionForm) {
    decisionForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = decisionForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Recording Your Decision...';
      }

      const formData = {
        firstName: document.getElementById('dec-first-name')?.value,
        lastName: document.getElementById('dec-last-name')?.value,
        email: document.getElementById('dec-email')?.value,
        city: document.getElementById('dec-city')?.value,
        country: document.getElementById('dec-country')?.value,
        reachOut: document.getElementById('dec-reachout')?.checked,
        notes: document.getElementById('dec-notes')?.value
      };

      try {
        const res = await fetch('/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();
        if (res.ok) {
          // Save seeker name locally for custom welcome greeting
          localStorage.setItem('outreach_seeker_name', formData.firstName);
          localStorage.setItem('outreach_decision_date', new Date().toLocaleDateString());
          window.location.href = data.redirect || '/welcome.html';
        } else {
          showToast(data.error || 'Failed to submit decision', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Submit My Decision';
          }
        }
      } catch (err) {
        showToast('Network error. Please try again.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Submit My Decision';
        }
      }
    });
  }

  // 3. "I Prayed This Prayer Today" Scroll & Reveal
  const prayerCommitBtn = document.getElementById('commit-prayer-btn');
  const decisionFormContainer = document.getElementById('decision-form-container');
  if (prayerCommitBtn && decisionFormContainer) {
    prayerCommitBtn.addEventListener('click', () => {
      decisionFormContainer.style.display = 'block';
      decisionFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      prayerCommitBtn.classList.add('btn-gold');
      prayerCommitBtn.innerHTML = '✓ You Prayed to Receive Christ';
    });
  }
});
