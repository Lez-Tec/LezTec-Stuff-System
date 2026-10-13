/**
 * StaffHub — Staff Management Dashboard
 * Fully Interactive Vanilla JavaScript Application
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Initial Seed Data (Matches KPI requirements: 7 Total, 6 Active, 5 Present, 1 Absent)
  // --------------------------------------------------------------------------
  const DEFAULT_STAFF_DATA = [
    {
      id: 'STF-001',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@leztec.com',
      department: 'Engineering',
      position: 'Lead Full-Stack Architect',
      attendance: 'Present',
      status: 'Active',
      color: '#6366f1'
    },
    {
      id: 'STF-002',
      name: 'Marcus Chen',
      email: 'marcus.chen@leztec.com',
      department: 'Product Design',
      position: 'Senior UI/UX Designer',
      attendance: 'Present',
      status: 'Active',
      color: '#ec4899'
    },
    {
      id: 'STF-003',
      name: 'Amara Okafor',
      email: 'amara.okafor@leztec.com',
      department: 'Operations',
      position: 'Head of Operations',
      attendance: 'Present',
      status: 'Active',
      color: '#10b981'
    },
    {
      id: 'STF-004',
      name: 'David Miller',
      email: 'david.miller@leztec.com',
      department: 'Engineering',
      position: 'Cloud DevOps Engineer',
      attendance: 'Late',
      status: 'Active',
      color: '#f59e0b'
    },
    {
      id: 'STF-005',
      name: 'Elena Rostova',
      email: 'elena.rostova@leztec.com',
      department: 'Marketing',
      position: 'Growth Marketing Lead',
      attendance: 'Present',
      status: 'Active',
      color: '#8b5cf6'
    },
    {
      id: 'STF-006',
      name: 'Thabo Mokoena',
      email: 'thabo.mokoena@leztec.com',
      department: 'Sales',
      position: 'Senior Enterprise AE',
      attendance: 'Absent',
      status: 'Active',
      color: '#3b82f6'
    },
    {
      id: 'STF-007',
      name: 'Chloe Bennett',
      email: 'chloe.bennett@leztec.com',
      department: 'Human Resources',
      position: 'People Operations Lead',
      attendance: 'Present',
      status: 'Inactive',
      color: '#14b8a6'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. State & Storage Management
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    STAFF: 'staffhub_employees_list',
    THEME: 'staffhub_theme_preference'
  };

  let staffList = [];
  let pendingDeleteId = null;

  function loadStaffData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (stored) {
        staffList = JSON.parse(stored);
      } else {
        staffList = [...DEFAULT_STAFF_DATA];
        saveStaffData();
      }
    } catch (e) {
      console.warn('Failed to parse localStorage, resetting to default data:', e);
      staffList = [...DEFAULT_STAFF_DATA];
    }
  }

  function saveStaffData() {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --------------------------------------------------------------------------
  // 3. DOM Elements Cache
  // --------------------------------------------------------------------------
  const elements = {
    // Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    // KPI Badges
    kpiTotalStaff: document.getElementById('kpiTotalStaff'),
    kpiActiveStaff: document.getElementById('kpiActiveStaff'),
    kpiPresentToday: document.getElementById('kpiPresentToday'),
    kpiAbsentToday: document.getElementById('kpiAbsentToday'),
    kpiActiveRate: document.getElementById('kpiActiveRate'),
    sidebarStaffCount: document.getElementById('sidebarStaffCount'),
    resultsCounter: document.getElementById('resultsCounter'),
    // Table
    tableBody: document.getElementById('staffTableBody'),
    emptyState: document.getElementById('emptyState'),
    emptyStateResetBtn: document.getElementById('emptyStateResetBtn'),
    // Filters & Search
    quickSearchInput: document.getElementById('quickSearchInput'),
    filterDepartment: document.getElementById('filterDepartment'),
    filterAttendance: document.getElementById('filterAttendance'),
    filterStatus: document.getElementById('filterStatus'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    // Actions
    exportBtn: document.getElementById('exportBtn'),
    openAddStaffModalBtn: document.getElementById('openAddStaffModalBtn'),
    // Staff Form Modal
    staffModalBackdrop: document.getElementById('staffModalBackdrop'),
    modalTitle: document.getElementById('modalTitle'),
    modalHeaderIcon: document.getElementById('modalHeaderIcon'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    modalSubmitBtn: document.getElementById('modalSubmitBtn'),
    modalSubmitText: document.getElementById('modalSubmitText'),
    staffForm: document.getElementById('staffForm'),
    staffFormMode: document.getElementById('staffFormMode'),
    editingStaffId: document.getElementById('editingStaffId'),
    // Form Inputs
    formStaffId: document.getElementById('formStaffId'),
    formFullName: document.getElementById('formFullName'),
    formEmail: document.getElementById('formEmail'),
    formDepartment: document.getElementById('formDepartment'),
    formPosition: document.getElementById('formPosition'),
    formAttendance: document.getElementById('formAttendance'),
    formStatus: document.getElementById('formStatus'),
    // Field Errors
    errorStaffId: document.getElementById('errorStaffId'),
    errorFullName: document.getElementById('errorFullName'),
    errorEmail: document.getElementById('errorEmail'),
    errorDepartment: document.getElementById('errorDepartment'),
    errorPosition: document.getElementById('errorPosition'),
    // Delete Modal
    deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
    deleteModalCloseBtn: document.getElementById('deleteModalCloseBtn'),
    deleteCancelBtn: document.getElementById('deleteCancelBtn'),
    deleteConfirmBtn: document.getElementById('deleteConfirmBtn'),
    deleteTargetStaffName: document.getElementById('deleteTargetStaffName'),
    deleteTargetStaffId: document.getElementById('deleteTargetStaffId'),
    // Mobile Navigation
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileCloseBtn: document.getElementById('mobileCloseBtn'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // --------------------------------------------------------------------------
  // 4. Utility Functions (Avatars, Colors, Escape)
  // --------------------------------------------------------------------------
  const AVATAR_PALETTE = [
    'linear-gradient(135deg, #6366f1, #818cf8)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    'linear-gradient(135deg, #14b8a6, #2dd4bf)',
    'linear-gradient(135deg, #f43f5e, #fb7185)'
  ];

  function getAvatarGradient(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[index];
  }

  function getInitials(name) {
    if (!name) return 'SH';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function generateNextStaffId() {
    let maxNum = 0;
    staffList.forEach(item => {
      const match = item.id.match(/^STF-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `STF-${String(nextNum).padStart(3, '0')}`;
  }

  // --------------------------------------------------------------------------
  // 5. Theme Toggle Logic
  // --------------------------------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  }

  // --------------------------------------------------------------------------
  // 6. Toast Notifications
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // 7. KPI Metrics Update
  // --------------------------------------------------------------------------
  function updateKPIs() {
    const total = staffList.length;
    const active = staffList.filter(s => s.status === 'Active').length;
    const present = staffList.filter(s => s.attendance === 'Present').length;
    const absent = staffList.filter(s => s.attendance === 'Absent').length;

    elements.kpiTotalStaff.textContent = total;
    elements.kpiActiveStaff.textContent = active;
    elements.kpiPresentToday.textContent = present;
    elements.kpiAbsentToday.textContent = absent;

    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
    elements.kpiActiveRate.textContent = `${activePercentage}% active`;

    if (elements.sidebarStaffCount) {
      elements.sidebarStaffCount.textContent = total;
    }
  }

  // --------------------------------------------------------------------------
  // 8. Render Table & Filters
  // --------------------------------------------------------------------------
  function getFilteredStaff() {
    const searchQuery = (elements.quickSearchInput.value || '').trim().toLowerCase();
    const deptFilter = elements.filterDepartment.value;
    const attendFilter = elements.filterAttendance.value;
    const statusFilter = elements.filterStatus.value;

    return staffList.filter(staff => {
      // Search matching
      const matchesSearch =
        !searchQuery ||
        staff.name.toLowerCase().includes(searchQuery) ||
        staff.id.toLowerCase().includes(searchQuery) ||
        staff.email.toLowerCase().includes(searchQuery) ||
        staff.department.toLowerCase().includes(searchQuery) ||
        staff.position.toLowerCase().includes(searchQuery);

      // Dropdown filters
      const matchesDept = deptFilter === 'ALL' || staff.department === deptFilter;
      const matchesAttend = attendFilter === 'ALL' || staff.attendance === attendFilter;
      const matchesStatus = statusFilter === 'ALL' || staff.status === statusFilter;

      return matchesSearch && matchesDept && matchesAttend && matchesStatus;
    });
  }

  function renderStaffTable() {
    const filtered = getFilteredStaff();
    elements.tableBody.innerHTML = '';

    elements.resultsCounter.textContent = `Showing ${filtered.length} of ${staffList.length} staff member${staffList.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      elements.emptyState.style.display = 'flex';
      return;
    }

    elements.emptyState.style.display = 'none';

    filtered.forEach(staff => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', staff.id);

      // Attendance Badge Class
      let attendBadgeClass = 'badge-present';
      if (staff.attendance === 'Absent') attendBadgeClass = 'badge-absent';
      if (staff.attendance === 'Late') attendBadgeClass = 'badge-late';

      // Status Badge Class
      const statusBadgeClass = staff.status === 'Active' ? 'badge-active' : 'badge-inactive';

      const avatarBackground = getAvatarGradient(staff.name);
      const initials = getInitials(staff.name);

      tr.innerHTML = `
        <td>
          <span class="staff-id-badge">${escapeHtml(staff.id)}</span>
        </td>
        <td>
          <div class="staff-profile-cell">
            <div class="staff-avatar-initials" style="background: ${avatarBackground};">
              ${initials}
            </div>
            <div class="staff-info-block">
              <span class="staff-name-text">${escapeHtml(staff.name)}</span>
              <span class="staff-email-text">${escapeHtml(staff.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="department-pill">
            <span class="dept-indicator-dot"></span>
            ${escapeHtml(staff.department)}
          </span>
        </td>
        <td>
          <span class="position-text">${escapeHtml(staff.position)}</span>
        </td>
        <td>
          <span class="status-badge ${attendBadgeClass}">
            <span class="badge-dot"></span>
            ${escapeHtml(staff.attendance)}
          </span>
        </td>
        <td>
          <span class="status-badge ${statusBadgeClass}">
            <span class="badge-dot"></span>
            ${escapeHtml(staff.status)}
          </span>
        </td>
        <td class="text-right">
          <div class="row-actions-group">
            <button class="action-icon-btn action-edit-btn" data-action="edit" data-id="${escapeHtml(staff.id)}" title="Edit ${escapeHtml(staff.name)}" aria-label="Edit employee">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-icon-btn action-delete-btn" data-action="delete" data-id="${escapeHtml(staff.id)}" title="Delete ${escapeHtml(staff.name)}" aria-label="Delete employee">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      `;

      elements.tableBody.appendChild(tr);
    });
  }

  // --------------------------------------------------------------------------
  // 9. Add & Edit Staff Modal Actions
  // --------------------------------------------------------------------------
  function openAddModal() {
    clearFormErrors();
    elements.staffForm.reset();
    elements.staffFormMode.value = 'ADD';
    elements.editingStaffId.value = '';
    elements.modalTitle.textContent = 'Add New Staff';
    elements.modalSubmitText.textContent = 'Add Staff Member';

    // Auto-generate next Staff ID
    elements.formStaffId.value = generateNextStaffId();
    elements.formStaffId.removeAttribute('readonly');

    elements.staffModalBackdrop.classList.add('is-open');
    elements.formFullName.focus();
  }

  function openEditModal(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    clearFormErrors();
    elements.staffFormMode.value = 'EDIT';
    elements.editingStaffId.value = staff.id;
    elements.modalTitle.textContent = 'Edit Staff Member';
    elements.modalSubmitText.textContent = 'Save Changes';

    elements.formStaffId.value = staff.id;
    elements.formStaffId.setAttribute('readonly', 'true');
    elements.formFullName.value = staff.name;
    elements.formEmail.value = staff.email;
    elements.formDepartment.value = staff.department;
    elements.formPosition.value = staff.position;
    elements.formAttendance.value = staff.attendance;
    elements.formStatus.value = staff.status;

    elements.staffModalBackdrop.classList.add('is-open');
    elements.formFullName.focus();
  }

  function closeStaffModal() {
    elements.staffModalBackdrop.classList.remove('is-open');
    clearFormErrors();
  }

  function clearFormErrors() {
    const errorIds = ['errorStaffId', 'errorFullName', 'errorEmail', 'errorDepartment', 'errorPosition'];
    errorIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    const invalidInputs = elements.staffForm.querySelectorAll('.is-invalid');
    invalidInputs.forEach(el => el.classList.remove('is-invalid'));
  }

  function validateStaffForm() {
    clearFormErrors();
    let isValid = true;
    const mode = elements.staffFormMode.value;
    const staffId = elements.formStaffId.value.trim();
    const fullName = elements.formFullName.value.trim();
    const email = elements.formEmail.value.trim();
    const department = elements.formDepartment.value;
    const position = elements.formPosition.value.trim();

    // Staff ID Validation
    if (!staffId) {
      elements.errorStaffId.textContent = 'Staff ID is required.';
      elements.formStaffId.classList.add('is-invalid');
      isValid = false;
    } else if (mode === 'ADD' && staffList.some(s => s.id.toLowerCase() === staffId.toLowerCase())) {
      elements.errorStaffId.textContent = 'This Staff ID already exists.';
      elements.formStaffId.classList.add('is-invalid');
      isValid = false;
    }

    // Full Name
    if (!fullName) {
      elements.errorFullName.textContent = 'Full name is required.';
      elements.formFullName.classList.add('is-invalid');
      isValid = false;
    } else if (fullName.length < 2) {
      elements.errorFullName.textContent = 'Name must be at least 2 characters.';
      elements.formFullName.classList.add('is-invalid');
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      elements.errorEmail.textContent = 'Work email is required.';
      elements.formEmail.classList.add('is-invalid');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      elements.errorEmail.textContent = 'Please enter a valid email address.';
      elements.formEmail.classList.add('is-invalid');
      isValid = false;
    }

    // Department
    if (!department) {
      elements.errorDepartment.textContent = 'Please select a department.';
      elements.formDepartment.classList.add('is-invalid');
      isValid = false;
    }

    // Position
    if (!position) {
      elements.errorPosition.textContent = 'Position title is required.';
      elements.formPosition.classList.add('is-invalid');
      isValid = false;
    }

    return isValid;
  }

  function handleStaffFormSubmit(e) {
    e.preventDefault();
    if (!validateStaffForm()) return;

    const mode = elements.staffFormMode.value;
    const staffId = elements.formStaffId.value.trim();
    const fullName = elements.formFullName.value.trim();
    const email = elements.formEmail.value.trim();
    const department = elements.formDepartment.value;
    const position = elements.formPosition.value.trim();
    const attendance = elements.formAttendance.value;
    const status = elements.formStatus.value;

    if (mode === 'ADD') {
      const newStaff = {
        id: staffId,
        name: fullName,
        email: email,
        department: department,
        position: position,
        attendance: attendance,
        status: status
      };

      staffList.unshift(newStaff);
      saveStaffData();
      updateKPIs();
      renderStaffTable();
      closeStaffModal();
      showToast(`Added ${fullName} to StaffHub records!`, 'success');
    } else {
      const targetId = elements.editingStaffId.value;
      const index = staffList.findIndex(s => s.id === targetId);
      if (index !== -1) {
        staffList[index] = {
          ...staffList[index],
          name: fullName,
          email: email,
          department: department,
          position: position,
          attendance: attendance,
          status: status
        };

        saveStaffData();
        updateKPIs();
        renderStaffTable();
        closeStaffModal();
        showToast(`Updated profile for ${fullName}.`, 'success');
      }
    }
  }

  // --------------------------------------------------------------------------
  // 10. Delete Staff Modal Actions
  // --------------------------------------------------------------------------
  function openDeleteModal(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    pendingDeleteId = staffId;
    elements.deleteTargetStaffName.textContent = staff.name;
    elements.deleteTargetStaffId.textContent = staff.id;
    elements.deleteModalBackdrop.classList.add('is-open');
  }

  function closeDeleteModal() {
    elements.deleteModalBackdrop.classList.remove('is-open');
    pendingDeleteId = null;
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;

    const staff = staffList.find(s => s.id === pendingDeleteId);
    const staffName = staff ? staff.name : 'Staff member';

    staffList = staffList.filter(s => s.id !== pendingDeleteId);
    saveStaffData();
    updateKPIs();
    renderStaffTable();
    closeDeleteModal();
    showToast(`Removed ${staffName} from records.`, 'danger');
  }

  // --------------------------------------------------------------------------
  // 11. Export to CSV Functionality
  // --------------------------------------------------------------------------
  function exportStaffToCSV() {
    if (staffList.length === 0) {
      showToast('No staff records to export.', 'info');
      return;
    }

    const headers = ['Staff ID', 'Full Name', 'Work Email', 'Department', 'Position', 'Attendance Today', 'Status'];
    const rows = staffList.map(staff => [
      `"${staff.id}"`,
      `"${staff.name.replace(/"/g, '""')}"`,
      `"${staff.email.replace(/"/g, '""')}"`,
      `"${staff.department.replace(/"/g, '""')}"`,
      `"${staff.position.replace(/"/g, '""')}"`,
      `"${staff.attendance}"`,
      `"${staff.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `staffhub_roster_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exported roster successfully to CSV!', 'success');
  }

  // --------------------------------------------------------------------------
  // 12. Reset Filters
  // --------------------------------------------------------------------------
  function resetAllFilters() {
    elements.quickSearchInput.value = '';
    elements.filterDepartment.value = 'ALL';
    elements.filterAttendance.value = 'ALL';
    elements.filterStatus.value = 'ALL';
    renderStaffTable();
    showToast('Filters reset to default.', 'info');
  }

  // --------------------------------------------------------------------------
  // 13. Mobile Drawer Controls
  // --------------------------------------------------------------------------
  function openMobileSidebar() {
    elements.sidebar.classList.add('is-open');
    elements.sidebarOverlay.classList.add('is-visible');
  }

  function closeMobileSidebar() {
    elements.sidebar.classList.remove('is-open');
    elements.sidebarOverlay.classList.remove('is-visible');
  }

  // --------------------------------------------------------------------------
  // 14. Event Listeners Setup
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Search and Filters
    elements.quickSearchInput.addEventListener('input', renderStaffTable);
    elements.filterDepartment.addEventListener('change', renderStaffTable);
    elements.filterAttendance.addEventListener('change', renderStaffTable);
    elements.filterStatus.addEventListener('change', renderStaffTable);
    elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    elements.emptyStateResetBtn.addEventListener('click', resetAllFilters);

    // Keyboard shortcut (Cmd+K / Ctrl+K) for quick search
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        elements.quickSearchInput.focus();
        elements.quickSearchInput.select();
      }
      if (e.key === 'Escape') {
        if (elements.staffModalBackdrop.classList.contains('is-open')) {
          closeStaffModal();
        }
        if (elements.deleteModalBackdrop.classList.contains('is-open')) {
          closeDeleteModal();
        }
        if (elements.sidebar.classList.contains('is-open')) {
          closeMobileSidebar();
        }
      }
    });

    // Header buttons
    elements.openAddStaffModalBtn.addEventListener('click', openAddModal);
    elements.exportBtn.addEventListener('click', exportStaffToCSV);

    // Table Row Actions (Event Delegation for Edit and Delete)
    elements.tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-action');
      const staffId = btn.getAttribute('data-id');

      if (action === 'edit') {
        openEditModal(staffId);
      } else if (action === 'delete') {
        openDeleteModal(staffId);
      }
    });

    // Staff Modal Events
    elements.modalCloseBtn.addEventListener('click', closeStaffModal);
    elements.modalCancelBtn.addEventListener('click', closeStaffModal);
    elements.staffModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.staffModalBackdrop) {
        closeStaffModal();
      }
    });
    elements.staffForm.addEventListener('submit', handleStaffFormSubmit);

    // Delete Modal Events
    elements.deleteModalCloseBtn.addEventListener('click', closeDeleteModal);
    elements.deleteCancelBtn.addEventListener('click', closeDeleteModal);
    elements.deleteConfirmBtn.addEventListener('click', confirmDelete);
    elements.deleteModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.deleteModalBackdrop) {
        closeDeleteModal();
      }
    });

    // Mobile Sidebar
    elements.mobileMenuBtn.addEventListener('click', openMobileSidebar);
    elements.mobileCloseBtn.addEventListener('click', closeMobileSidebar);
    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  // --------------------------------------------------------------------------
  // 15. Application Bootstrapping
  // --------------------------------------------------------------------------
  function init() {
    initTheme();
    loadStaffData();
    updateKPIs();
    renderStaffTable();
    setupEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
