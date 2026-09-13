// Admin Console & Ministry Follow-Up JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  const decisionsTableBody = document.getElementById('admin-decisions-tbody');
  const prayersTableBody = document.getElementById('admin-prayers-tbody');
  const dripContainer = document.getElementById('admin-drip-container');
  const testDripForm = document.getElementById('test-drip-form');

  // KPI elements
  const kpiDecisions = document.getElementById('kpi-decisions');
  const kpiFollowup = document.getElementById('kpi-followup');
  const kpiPrayers = document.getElementById('kpi-prayers');
  const kpiSubscribers = document.getElementById('kpi-subscribers');

  async function loadAdminData() {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();

      // Render KPIs
      if (kpiDecisions) kpiDecisions.innerText = data.counts.totalDecisions;
      if (kpiFollowup) kpiFollowup.innerText = data.counts.needFollowUp;
      if (kpiPrayers) kpiPrayers.innerText = data.counts.totalPrayers;
      if (kpiSubscribers) kpiSubscribers.innerText = data.counts.totalSubscribers;

      const kpiOutreach = document.getElementById('kpi-outreach');
      const kpiTrainees = document.getElementById('kpi-trainees');
      const kpiMembers = document.getElementById('kpi-members');
      const kpiPartners = document.getElementById('kpi-partners');
      if (kpiOutreach) kpiOutreach.innerText = data.counts.totalOutreachInvites || 0;
      if (kpiTrainees) kpiTrainees.innerText = data.counts.totalTrainees || 0;
      if (kpiMembers) kpiMembers.innerText = data.counts.totalMembers || 0;
      if (kpiPartners) kpiPartners.innerText = data.counts.totalPartners || 0;

      // Render Decisions Table
      if (decisionsTableBody) {
        if (!data.decisions || data.decisions.length === 0) {
          decisionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:1.5rem;">No decisions recorded yet.</td></tr>';
        } else {
          decisionsTableBody.innerHTML = data.decisions.map(d => {
            const date = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `
              <tr>
                <td><strong>${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)}</strong></td>
                <td><a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></td>
                <td>${escapeHtml(d.city || '-')}, ${escapeHtml(d.country || '-')}</td>
                <td>
                  ${d.reachOut 
                    ? '<span class="status-pill status-urgent">Needs Contact</span>' 
                    : '<span class="status-pill status-neutral">Self Study</span>'}
                </td>
                <td>
                  <select class="form-select-sm" onchange="updateDecisionStatus('${d.id}', this.value)" style="padding:0.3rem 0.5rem; border-radius:4px; font-size:0.8rem;">
                    <option value="New" ${d.status === 'New' ? 'selected' : ''}>New</option>
                    <option value="Contacted" ${d.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                    <option value="In Discipleship" ${d.status === 'In Discipleship' ? 'selected' : ''}>In Discipleship</option>
                    <option value="Connected to Church" ${d.status === 'Connected to Church' ? 'selected' : ''}>Connected to Church</option>
                  </select>
                </td>
                <td style="font-size:0.8rem; color:var(--color-text-muted);">${date}</td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="viewDecisionNotes('${escapeHtml(d.notes || 'No notes provided.')}')">Notes</button>
                </td>
              </tr>
            `;
          }).join('');
        }
      }

      // Render Prayers Table
      if (prayersTableBody) {
        if (!data.prayers || data.prayers.length === 0) {
          prayersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">No prayer requests in database.</td></tr>';
        } else {
          prayersTableBody.innerHTML = data.prayers.map(p => {
            const date = new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td><span class="status-pill status-neutral">${escapeHtml(p.category)}</span></td>
                <td style="max-width:320px; font-size:0.85rem;">${escapeHtml(p.request)}</td>
                <td><strong>${p.prayCount || 1}</strong> prayers</td>
                <td style="font-size:0.8rem; color:var(--color-text-muted);">${date}</td>
              </tr>
            `;
          }).join('');
        }
      }

      // Render Outreach Invitations Table
      const outreachTbody = document.getElementById('admin-outreach-tbody');
      if (outreachTbody && data.outreachInvitations) {
        if (data.outreachInvitations.length === 0) {
          outreachTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:1.5rem;">No outreach invitations yet.</td></tr>';
        } else {
          outreachTbody.innerHTML = data.outreachInvitations.map(inv => `
            <tr>
              <td><strong>${escapeHtml(inv.organization)}</strong></td>
              <td>${escapeHtml(inv.contactName)}</td>
              <td><a href="mailto:${escapeHtml(inv.email)}">${escapeHtml(inv.email)}</a><br><small>${escapeHtml(inv.phone || 'No phone')}</small></td>
              <td>${escapeHtml(inv.city)}, ${escapeHtml(inv.country)}</td>
              <td><span class="status-pill status-neutral">${escapeHtml(inv.eventType)}</span></td>
              <td>${escapeHtml(inv.expectedAudience)}</td>
              <td><span class="status-pill status-urgent">${escapeHtml(inv.status || 'Reviewing')}</span></td>
            </tr>
          `).join('');
        }
      }

      // Render Missionary Training Applications Table
      const trainingTbody = document.getElementById('admin-training-tbody');
      if (trainingTbody && data.trainingApplications) {
        if (data.trainingApplications.length === 0) {
          trainingTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem;">No training applications yet.</td></tr>';
        } else {
          trainingTbody.innerHTML = data.trainingApplications.map(trn => `
            <tr>
              <td><strong>${escapeHtml(trn.fullName)}</strong></td>
              <td><a href="mailto:${escapeHtml(trn.email)}">${escapeHtml(trn.email)}</a><br><small>${escapeHtml(trn.phone || '')}</small></td>
              <td>${escapeHtml(trn.city)}, ${escapeHtml(trn.country)}</td>
              <td><span class="status-pill status-neutral">${escapeHtml(trn.cohort)}</span></td>
              <td style="max-width:280px; font-size:0.85rem;">${escapeHtml(trn.calling)}</td>
              <td><span class="status-pill status-urgent">${escapeHtml(trn.status || 'Under Review')}</span></td>
            </tr>
          `).join('');
        }
      }

      // Render Membership Roster Table
      const membersTbody = document.getElementById('admin-members-tbody');
      if (membersTbody && data.memberships) {
        if (data.memberships.length === 0) {
          membersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem;">No members registered yet.</td></tr>';
        } else {
          membersTbody.innerHTML = data.memberships.map(mem => `
            <tr>
              <td><strong>${escapeHtml(mem.fullName)}</strong></td>
              <td><a href="mailto:${escapeHtml(mem.email)}">${escapeHtml(mem.email)}</a></td>
              <td>${escapeHtml(mem.city)}, ${escapeHtml(mem.country)}</td>
              <td><span class="status-pill status-neutral">${escapeHtml(mem.involvement)}</span></td>
              <td><span class="status-pill status-neutral" style="background:#EBF3EE; color:#2E6B4F;">${escapeHtml(mem.status || 'Active Member')}</span></td>
            </tr>
          `).join('');
        }
      }

      // Render Kingdom Partnership Table
      const partnersTbody = document.getElementById('admin-partners-tbody');
      if (partnersTbody && data.partnerships) {
        if (data.partnerships.length === 0) {
          partnersTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem;">No partnership pledges recorded yet.</td></tr>';
        } else {
          partnersTbody.innerHTML = data.partnerships.map(prt => {
            const date = new Date(prt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `
              <tr>
                <td><strong>${escapeHtml(prt.partnerName)}</strong></td>
                <td><a href="mailto:${escapeHtml(prt.email)}">${escapeHtml(prt.email)}</a></td>
                <td><span class="status-pill status-neutral">${escapeHtml(prt.tier)}</span></td>
                <td><strong style="color:var(--color-accent);">${escapeHtml(prt.amount)}</strong></td>
                <td>${escapeHtml(prt.frequency)}</td>
                <td style="font-size:0.8rem; color:var(--color-text-muted);">${date}</td>
              </tr>
            `;
          }).join('');
        }
      }

      // Render 7-Day Email Drip Sequence
      if (dripContainer && data.dripSeries) {
        dripContainer.innerHTML = data.dripSeries.map(email => `
          <div class="drip-card" style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:8px; padding:1.25rem; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--color-accent); background:var(--color-accent-light); padding:0.2rem 0.6rem; border-radius:999px;">Day ${email.day} Sequence</span>
              <button class="btn btn-sm btn-outline" onclick="previewEmailModal(${email.day})">Inspect Full Copy</button>
            </div>
            <h4 style="margin:0 0 0.25rem 0; font-size:1.05rem;">${escapeHtml(email.subject)}</h4>
            <p style="font-size:0.85rem; color:var(--color-text-secondary); margin:0;">${escapeHtml(email.preview)}</p>
          </div>
        `).join('');

        window.dripSeries = data.dripSeries;
      }

    } catch (err) {
      console.error('Admin loading failed:', err);
    }
  }

  // Update decision status
  window.updateDecisionStatus = async function(id, newStatus) {
    try {
      const res = await fetch(`/api/admin/decisions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Status updated to "${newStatus}"`, 'success');
        loadAdminData();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  // View seeker notes modal
  window.viewDecisionNotes = function(notes) {
    alert(`Seeker Reflection / Notes:\n\n${notes}`);
  };

  // Preview Email Modal
  window.previewEmailModal = function(day) {
    if (!window.dripSeries) return;
    const email = window.dripSeries.find(e => e.day === day);
    if (!email) return;

    const modal = document.getElementById('email-preview-modal');
    const title = document.getElementById('email-modal-subject');
    const body = document.getElementById('email-modal-body');

    if (modal && title && body) {
      title.innerText = `[Day ${email.day}] ${email.subject}`;
      body.innerHTML = escapeHtml(email.body).replace(/\n/g, '<br>');
      modal.classList.add('active');
    }
  };

  // Test send simulation form
  if (testDripForm) {
    testDripForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('test-email')?.value;
      const day = document.getElementById('test-day')?.value;

      try {
        const res = await fetch('/api/admin/test-drip-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, day })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`✓ Simulated Day ${day} email dispatched to ${email}!`, 'success');
        }
      } catch (err) {
        showToast('Simulation failed', 'error');
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  loadAdminData();
});
