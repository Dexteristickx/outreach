// Global JavaScript - Navigation, Search Modal, Toast, Newsletter
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const expanded = navMenu.classList.contains('open');
      mobileBtn.setAttribute('aria-expanded', expanded);
    });
  }

  // 1b. Dropdown Accordion for Mobile
  const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        const parent = trigger.closest('.nav-item-dropdown');
        if (parent) {
          parent.classList.toggle('mobile-expanded');
        }
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item-dropdown')) {
      document.querySelectorAll('.nav-item-dropdown.mobile-expanded').forEach(el => {
        el.classList.remove('mobile-expanded');
      });
    }
  });

  // 2. Global Search Modal (Cmd+K / Ctrl+K)
  const searchTriggers = document.querySelectorAll('.search-trigger');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const modalClose = document.querySelector('.search-modal-close');

  function openSearch() {
    if (searchModal) {
      searchModal.classList.add('active');
      if (searchInput) {
        searchInput.focus();
        searchInput.value = '';
      }
      if (searchResults) searchResults.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem;">Type to search Gospel topics, doubts, articles, or testimonies...</p>';
    }
  }

  function closeSearch() {
    if (searchModal) searchModal.classList.remove('active');
  }

  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  if (modalClose) modalClose.addEventListener('click', closeSearch);

  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  // Search input debounce
  let searchTimeout = null;
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim();
      if (query.length < 2) {
        searchResults.innerHTML = '<p class="text-muted" style="text-align:center; padding:1.5rem;">Type at least 2 characters to search...</p>';
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (!data.results || data.results.length === 0) {
            searchResults.innerHTML = `<p class="text-muted" style="text-align:center; padding:1.5rem;">No results found for "<em>${query}</em>". Try "Jesus", "Grace", or "Anxiety".</p>`;
            return;
          }

          searchResults.innerHTML = data.results.map(item => `
            <a href="${item.url}" class="search-result-item" style="display:block; padding:0.85rem; border-radius:8px; margin-bottom:0.5rem; text-decoration:none; color:inherit; background:var(--color-surface-warm); border:1px solid var(--color-border); transition:all 0.2s ease;">
              <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--color-accent);">${item.type}</span>
              <h4 style="margin:0.25rem 0; font-size:1.05rem;">${item.title}</h4>
              <p style="margin:0; font-size:0.85rem; color:var(--color-text-secondary);">${item.snippet}</p>
            </a>
          `).join('');
        } catch (err) {
          searchResults.innerHTML = '<p style="color:var(--color-danger); text-align:center;">Error performing search.</p>';
        }
      }, 250);
    });
  }

  // 3. Global Newsletter Submissions
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (!emailInput) return;
      const email = emailInput.value;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Subscribed successfully!', 'success');
          form.reset();
        } else {
          showToast(data.error || 'Subscription failed', 'error');
        }
      } catch (err) {
        showToast('Unable to connect. Please try again.', 'error');
      }
    });
  });
});

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed; bottom:2rem; left:50%; transform:translateX(-50%); z-index:9999; display:flex; flex-direction:column; gap:0.5rem; pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#2E6B4F' : '#B93838';
  toast.style.cssText = `background:${bgColor}; color:#FFFFFF; padding:0.75rem 1.4rem; border-radius:8px; font-size:0.95rem; font-weight:500; box-shadow:0 6px 20px rgba(0,0,0,0.18); transition:opacity 0.3s ease, transform 0.3s ease; pointer-events:auto; display:flex; align-items:center; gap:0.5rem;`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
