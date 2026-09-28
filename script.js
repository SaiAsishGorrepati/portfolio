(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const navLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme preference is user-controlled and remembered between visits.
  let savedTheme = null;
  try { savedTheme = localStorage.getItem('sai-asish-theme'); } catch (_) { /* Storage may be disabled. */ }
  const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(initialTheme, false);

  themeButton.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });

  function setTheme(theme, persist) {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'dark' ? '#10171d' : '#f5f5f0';
    if (persist) {
      try { localStorage.setItem('sai-asish-theme', theme); } catch (_) { /* Theme still works for this visit. */ }
    }
  }

  // Mobile menu: keep the control state, body scroll, and navigation in sync.
  function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  // Reveal content as it enters the viewport. Keep everything visible on older browsers.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Navigation highlights the current section while scrolling.
  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const currentId = `#${entry.target.id}`;
        navLinks.forEach(link => {
          const isCurrent = link.getAttribute('href') === currentId;
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { threshold: 0, rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => activeObserver.observe(section));
  }

  // Skill category controls filter the complete skill list without assigning levels.
  const filterButtons = [...document.querySelectorAll('.filter-button')];
  const skillChips = [...document.querySelectorAll('.skill-chip')];
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      filterButtons.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      skillChips.forEach(chip => {
        chip.hidden = selected !== 'all' && chip.dataset.category !== selected;
      });
    });
  });

  // The interests panel is an exploratory interaction, not a proficiency chart.
  const interestCopy = {
    ai: 'How AI can turn a technical idea into something genuinely useful.',
    ml: 'How patterns in data can become tools for better decisions.',
    nlp: 'How careful text processing can help compare skills with an opportunity.',
    vision: 'How deep learning can bring useful detail back to low-light images.'
  };
  const interestResponse = document.querySelector('#interest-response');
  document.querySelectorAll('.interest-tile').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.interest-tile').forEach(item => {
        const active = item === button;
        item.setAttribute('aria-pressed', String(active));
      });
      interestResponse.textContent = interestCopy[button.dataset.interest];
    });
  });

  const projectNotes = {
    resume: {
      index: 'PROJECT 01 / AI · NLP',
      title: 'Automated Resume Job-Matching System',
      description: 'An NLP workflow that processes resumes and job descriptions, compares their content, and generates relevance scores to support candidate shortlisting.',
      steps: [
        'Prepare resume and job-description text with tokenization, stop-word removal, and normalization.',
        'Represent the processed text using TF-IDF.',
        'Use cosine similarity to calculate relevance scores and help automate candidate shortlisting.'
      ],
      tools: ['Python', 'NLP', 'TF-IDF', 'Cosine Similarity', 'Machine Learning'],
      subject: 'Resume Job-Matching System'
    },
    vision: {
      index: 'PROJECT 02 / DEEP LEARNING · COMPUTER VISION',
      title: 'Low-Light Image Enhancement (Zero-DCE)',
      description: 'A deep learning project focused on improving visibility in low-light images. The work used more than 1,000 images from LOL/DarkFace datasets.',
      steps: [
        'Train a Zero-DCE low-light image enhancement model using LOL/DarkFace image data.',
        'Reduce the reported training loss from 6.54 to 1.09.',
        'Report approximately 200 ms per inference step on a Tesla T4 GPU, with real-time inference as the project target.'
      ],
      tools: ['Python', 'Deep Learning', 'Zero-DCE', 'LOL / DarkFace', 'GPU Computing'],
      subject: 'Zero-DCE Project'
    }
  };
  const dialog = document.querySelector('.project-dialog');
  const dialogIndex = dialog.querySelector('.dialog-index');
  const dialogTitle = dialog.querySelector('#dialog-title');
  const dialogDescription = dialog.querySelector('.dialog-description');
  const dialogSteps = dialog.querySelector('.dialog-steps');
  const dialogTools = dialog.querySelector('.dialog-tools');
  const dialogContact = dialog.querySelector('.dialog-contact');

  document.querySelectorAll('.project-details').forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'project-dialog');
    button.addEventListener('click', () => {
      const project = projectNotes[button.dataset.project];
      if (!project) return;
      dialogIndex.textContent = project.index;
      dialogTitle.textContent = project.title;
      dialogDescription.textContent = project.description;
      dialogSteps.replaceChildren();
      project.steps.forEach((step, index) => {
        const row = document.createElement('div');
        row.className = 'dialog-step';
        const number = document.createElement('span');
        number.textContent = String(index + 1).padStart(2, '0');
        const content = document.createElement('p');
        content.textContent = step;
        row.append(number, content);
        dialogSteps.append(row);
      });
      dialogTools.replaceChildren();
      project.tools.forEach(tool => {
        const tag = document.createElement('span');
        tag.textContent = tool;
        dialogTools.append(tag);
      });
      dialogContact.href = `https://mail.google.com/mail/?view=cm&fs=1&to=saiasish16%40gmail.com&su=${encodeURIComponent(project.subject)}`;
      dialogContact.target = '_blank';
      dialogContact.rel = 'noopener noreferrer';
      dialog.showModal();
    });
  });

  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  const year = new Date().getFullYear();
  document.querySelectorAll('#hero-year, #footer-year').forEach(node => { node.textContent = year; });
})();
