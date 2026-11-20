const tabs = Array.from(document.querySelectorAll('.chapter-nav [role="tab"]'));
const panels = Array.from(document.querySelectorAll('.chapters [role="tabpanel"]'));

function activateTab(selectedTab) {
  const targetId = selectedTab.getAttribute('aria-controls');
  for (const tab of tabs) {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
  }
  for (const panel of panels) {
    if (panel.id === targetId) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  }
}

for (const tab of tabs) {
  tab.addEventListener('click', () => activateTab(tab));
}

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isHidden = mobileNav.hasAttribute('hidden');
    if (isHidden) {
      mobileNav.removeAttribute('hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
    } else {
      mobileNav.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  mobileNav.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      mobileNav.setAttribute('hidden', '');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
