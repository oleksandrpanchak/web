document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('addListingModal');
  const form = document.getElementById('addListingForm');
  const dialog = modal?.querySelector('[data-modal-dialog]');
  const menuButton = document.querySelector('.jh-menu-toggle');
  const navigation = document.getElementById('siteNavigation');
  const mobile = window.matchMedia('(max-width: 1199px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
  let returnFocus = null;
  let backgroundState = [];

  const menuIsOpen = () => menuButton?.getAttribute('aria-expanded') === 'true';
  const modalIsOpen = () => modal?.classList.contains('is-open');
  const syncScroll = () => document.body.classList.toggle('jh-scroll-lock', Boolean(modalIsOpen() || menuIsOpen()));

  function setMenu(open, restoreFocus = false) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    navigation.classList.toggle('is-open', open);
    navigation.inert = mobile.matches && !open;
    syncScroll();
    if (restoreFocus) menuButton.focus();
  }

  function openModal(event) {
    event?.preventDefault();
    if (!modal || !dialog) return;
    returnFocus = event?.currentTarget || document.activeElement;
    setMenu(false);
    backgroundState = Array.from(document.body.children)
      .filter(element => element !== modal && !['SCRIPT', 'STYLE'].includes(element.tagName))
      .map(element => ({ element, inert: element.inert }));
    backgroundState.forEach(({ element }) => { element.inert = true; });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    syncScroll();
    dialog.querySelector('input')?.focus();
  }

  function closeModal() {
    if (!modalIsOpen()) return;
    modal.classList.remove('is-open');
    backgroundState.forEach(({ element, inert }) => { element.inert = inert; });
    backgroundState = [];
    syncScroll();
    returnFocus?.focus();
    modal.setAttribute('aria-hidden', 'true');
  }

  function keepFocus(event, elements) {
    const available = elements.filter(element => element.getClientRects().length && !element.closest('[inert]'));
    if (!available.length) return;
    const first = available[0];
    const last = available[available.length - 1];
    if (event.shiftKey && (document.activeElement === first || !available.includes(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !available.includes(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  document.querySelectorAll('[data-modal-open="add-listing"]').forEach(button => button.addEventListener('click', openModal));
  modal?.querySelectorAll('[data-modal-close], [data-modal-overlay]').forEach(button => button.addEventListener('click', closeModal));
  menuButton?.addEventListener('click', () => setMenu(!menuIsOpen()));
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (menuIsOpen() && !navigation.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));
  setMenu(false);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (modalIsOpen()) closeModal();
      else if (menuIsOpen()) setMenu(false, true);
    }
    if (event.key === 'Tab') {
      if (modalIsOpen()) keepFocus(event, Array.from(dialog.querySelectorAll(focusableSelector)));
      else if (menuIsOpen()) keepFocus(event, [menuButton, ...navigation.querySelectorAll(focusableSelector)]);
    }
  });

  function validateField(field) {
    const value = field.value.trim();
    let error = '';
    if (!value || field.validity.badInput) error = 'Заповніть це поле.';
    else if (field.id === 'listingName' && (value.length < 5 || value.length > 100)) error = 'Вкажіть назву від 5 до 100 символів.';
    else if (field.id === 'listingCity' && (value.length < 2 || value.length > 100)) error = 'Вкажіть місцевість від 2 до 100 символів.';
    else if (field.id === 'listingType' && !['house', 'cottage', 'dacha', 'townhouse', 'villa'].includes(value)) error = 'Оберіть тип заміської нерухомості.';
    else if (field.id === 'listingArea' && (!Number.isFinite(Number(value)) || Number(value) < 10 || Number(value) > 5000 || field.validity.stepMismatch)) error = 'Вкажіть площу від 10 до 5000 м², не більше одного знака після коми.';
    else if (field.id === 'listingComment' && (value.length < 20 || value.length > 1500)) error = 'Опишіть будинок і ділянку: від 20 до 1500 символів.';
    const message = document.getElementById(field.id + 'Error');
    if (message) message.textContent = error;
    field.setAttribute('aria-invalid', String(Boolean(error)));
    return !error;
  }

  if (form) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
      field.addEventListener('change', () => validateField(field));
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const results = fields.map(field => validateField(field));
      const firstInvalid = results.indexOf(false);
      if (firstInvalid !== -1) {
        fields[firstInvalid].focus();
        return;
      }
      closeModal();
    });
  }

  const upButton = document.getElementById('scrollToTop');
  if (upButton) {
    const updateUpButton = () => upButton.classList.toggle('is-visible', window.scrollY > 300);
    window.addEventListener('scroll', updateUpButton, { passive: true });
    updateUpButton();
    upButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
  }

  document.querySelectorAll('[data-navigation]').forEach(control => {
    const navigate = () => window.location.assign(control.dataset.navigation);
    control.addEventListener('click', navigate);
    if (control.getAttribute('role') === 'link') {
      control.addEventListener('keydown', event => {
        if (event.key === 'Enter') navigate();
      });
    }
  });

  const track = document.querySelector('.jh-property-track');
  document.querySelectorAll('[data-property-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      if (!track) return;
      const card = track.firstElementChild;
      const distance = card.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
      track.scrollBy({ left: Number(button.dataset.propertyScroll) * distance, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  });
});
