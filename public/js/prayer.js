// Community Prayer Wall & Requests Interactivity
document.addEventListener('DOMContentLoaded', () => {
  const prayerGrid = document.getElementById('prayer-grid');
  const prayerForm = document.getElementById('prayer-form');
  const categoryFilter = document.getElementById('prayer-category-filter');

  // Track prayers the current user has prayed for in localStorage
  function getPrayedIds() {
    try {
      return JSON.parse(localStorage.getItem('outreach_prayed_ids') || '[]');
    } catch (e) {
      return [];
    }
  }

  function addPrayedId(id) {
    const ids = getPrayedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem('outreach_prayed_ids', JSON.stringify(ids));
    }
  }

  // Render a single prayer card
  function renderPrayerCard(prayer) {
    const prayedIds = getPrayedIds();
    const hasPrayed = prayedIds.includes(prayer.id);
    const dateFormatted = new Date(prayer.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="prayer-card fade-in" data-id="${prayer.id}" data-category="${prayer.category}">
        <div>
          <div class="prayer-meta">
            <span class="prayer-author">${escapeHtml(prayer.name)}</span>
            <span class="prayer-category">${escapeHtml(prayer.category || 'General')}</span>
          </div>
          <p class="prayer-request-text">"${escapeHtml(prayer.request)}"</p>
        </div>
        <div class="prayer-footer">
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${dateFormatted}</span>
          <button class="pray-action-btn ${hasPrayed ? 'has-prayed' : ''}" onclick="prayForRequest('${prayer.id}', this)">
            <svg viewBox="0 0 24 24" fill="${hasPrayed ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="pray-label">${hasPrayed ? 'I Prayed' : 'Pray for This'}</span>
            <span class="pray-count">(${prayer.prayCount || 1})</span>
          </button>
        </div>
      </div>
    `;
  }

  // Fetch and display prayers
  async function loadPrayers() {
    if (!prayerGrid) return;
    try {
      const res = await fetch('/api/prayers');
      const data = await res.json();
      if (data.prayers && data.prayers.length > 0) {
        window.allPrayers = data.prayers;
        filterAndRender();
      } else {
        prayerGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No prayer requests yet. Be the first to share your heart.</p>';
      }
    } catch (err) {
      prayerGrid.innerHTML = '<p style="color:var(--color-danger); grid-column: 1/-1; text-align: center;">Unable to load prayers. Please refresh.</p>';
    }
  }

  function filterAndRender() {
    if (!window.allPrayers) return;
    const cat = categoryFilter ? categoryFilter.value : 'All';
    const filtered = cat === 'All' 
      ? window.allPrayers 
      : window.allPrayers.filter(p => p.category === cat);

    if (filtered.length === 0) {
      prayerGrid.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No prayers in this category yet.</p>';
    } else {
      prayerGrid.innerHTML = filtered.map(renderPrayerCard).join('');
    }
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterAndRender);
  }

  // Handle Prayer Submission Form
  if (prayerForm) {
    prayerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = prayerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Submitting Request';
      }

      const payload = {
        name: document.getElementById('prayer-name')?.value || 'Anonymous',
        request: document.getElementById('prayer-text')?.value,
        category: document.getElementById('prayer-cat-select')?.value || 'General',
        isPublic: document.getElementById('prayer-public-checkbox') ? document.getElementById('prayer-public-checkbox').checked : true
      };

      try {
        const res = await fetch('/api/prayers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          showToast('Your prayer request has been received with love.', 'success');
          prayerForm.reset();
          if (payload.isPublic && prayerGrid && data.prayer) {
            window.allPrayers = window.allPrayers || [];
            window.allPrayers.unshift(data.prayer);
            filterAndRender();
          }
        } else {
          showToast(data.error || 'Submission error', 'error');
        }
      } catch (err) {
        showToast('Network error. Please try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Send Prayer Request';
        }
      }
    });
  }

  // Global pray action
  window.prayForRequest = async function(id, btn) {
    const prayedIds = getPrayedIds();
    if (prayedIds.includes(id)) {
      showToast('You have already prayed for this brother or sister. Thank you for your continued intercession!', 'success');
      return;
    }

    try {
      const res = await fetch(`/api/prayers/${id}/pray`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addPrayedId(id);
        btn.classList.add('has-prayed');
        const countSpan = btn.querySelector('.pray-count');
        const labelSpan = btn.querySelector('.pray-label');
        if (countSpan) countSpan.innerText = `(${data.prayCount})`;
        if (labelSpan) labelSpan.innerText = 'I Prayed';
        showToast('You stood in prayer for this request. God hears our united cry!', 'success');
      }
    } catch (err) {
      showToast('Failed to record prayer.', 'error');
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  loadPrayers();
});
