// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('nav-open');
  navToggle?.classList.toggle('nav-toggle-active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks?.classList.remove('nav-open');
    navToggle?.classList.remove('nav-toggle-active');
  });
});

// Scroll Reveal
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.work-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${Math.min(i * 0.08, 0.25)}s`;
  observer.observe(el);
});

document.querySelectorAll('.info-content, .footer').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});
