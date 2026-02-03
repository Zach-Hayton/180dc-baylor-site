/* =========================================
   180DC Baylor - Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav ---
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  // --- Hero background slider ---
  const heroBg = document.getElementById('heroBackground');
  const heroIndicators = document.getElementById('heroIndicators');
  if (heroBg) {
    const slides = [
      'assets/images/group-formal.png',
      'assets/images/collab.png',
      'assets/images/working.png',
      'assets/images/networking.png'
    ];
    let currentSlide = 0;
    heroBg.style.backgroundImage = `url('${slides[0]}')`;

    if (heroIndicators) {
      heroIndicators.children[0].classList.add('active');
    }

    function changeSlide(idx) {
      if (idx === undefined) {
        currentSlide = (currentSlide + 1) % slides.length;
      } else {
        currentSlide = idx;
      }
      heroBg.style.opacity = 0;
      setTimeout(() => {
        heroBg.style.backgroundImage = `url('${slides[currentSlide]}')`;
        heroBg.style.opacity = 1;
      }, 600);
      if (heroIndicators) {
        Array.from(heroIndicators.children).forEach((dot, i) => {
          dot.classList.toggle('active', i === currentSlide);
        });
      }
    }

    setInterval(() => changeSlide(), 5000);

    if (heroIndicators) {
      Array.from(heroIndicators.children).forEach((dot, i) => {
        dot.addEventListener('click', () => changeSlide(i));
      });
    }
  }

  // --- Video modal ---
  const videoCard = document.getElementById('videoCard');
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const videoModalClose = document.getElementById('videoModalClose');
  const videoOverlay = videoModal ? videoModal.querySelector('.modal-overlay') : null;

  if (videoCard && videoModal && videoFrame) {
    videoCard.addEventListener('click', () => {
      videoFrame.src = 'https://www.youtube.com/embed/zkgZ5LiRiZA?autoplay=1';
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeVideoModal = () => {
      videoModal.classList.remove('active');
      videoFrame.src = '';
      document.body.style.overflow = '';
    };

    if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
    if (videoOverlay) videoOverlay.addEventListener('click', closeVideoModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) closeVideoModal();
    });
  }

  // --- Calendar Booking ---
  const calendarEl = document.getElementById('calendarWidget');
  if (calendarEl) {
    const teamPicker = document.getElementById('teamPicker');
    const calendarStep = document.getElementById('calendarStep');
    const calendarGrid = calendarStep.querySelector('.calendar-grid');
    const calendarTitle = calendarStep.querySelector('.calendar-header h4');
    const prevBtn = calendarStep.querySelector('#calPrev');
    const nextBtn = calendarStep.querySelector('#calNext');
    const timeSlotsEl = calendarStep.querySelector('.time-slots');
    const timeSlotsGrid = calendarStep.querySelector('.time-slots-grid');
    const bookingDetails = calendarStep.querySelector('.booking-details');
    const bookingConfirmation = document.getElementById('bookingConfirmation');
    const selectedInfo = calendarStep.querySelector('#selectedInfo');
    const selectedMemberInfo = document.getElementById('selectedMemberInfo');
    const confirmBtn = calendarStep.querySelector('#confirmBooking');
    const backToCalBtn = calendarStep.querySelector('#backToCal');
    const backToTeamBtn = document.getElementById('backToTeam');

    // Sidebar panel elements
    const bookingImg = document.getElementById('bookingImg');
    const bookingCardName = document.getElementById('bookingCardName');
    const bookingCardRole = document.getElementById('bookingCardRole');

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    let currentMonth = 1; // Feb 2026
    let currentYear = 2026;
    let selectedDate = null;
    let selectedTime = null;

    // Selected team member
    let selectedMember = { name: '', role: '', email: '', img: '' };

    // Team picker click handlers
    const pickerCards = teamPicker.querySelectorAll('.team-picker-card');
    pickerCards.forEach(card => {
      card.addEventListener('click', () => {
        selectedMember.name = card.dataset.name;
        selectedMember.role = card.dataset.role;
        selectedMember.email = card.dataset.email;
        selectedMember.img = card.dataset.img;

        // Highlight selected card
        pickerCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Update sidebar image and info
        if (bookingImg && selectedMember.img && !selectedMember.img.includes('placeholder')) {
          bookingImg.src = selectedMember.img;
          bookingImg.alt = selectedMember.name;
          bookingImg.style.display = 'block';
        } else if (bookingImg) {
          bookingImg.style.display = 'none';
        }
        if (bookingCardName) bookingCardName.textContent = selectedMember.name;
        if (bookingCardRole) bookingCardRole.textContent = selectedMember.role + ', 180DC Baylor';

        // Show calendar step, hide picker
        teamPicker.style.display = 'none';
        calendarStep.style.display = 'block';
        selectedMemberInfo.textContent = 'Booking with ' + selectedMember.name;

        // Reset calendar state
        selectedDate = null;
        selectedTime = null;
        timeSlotsEl.style.display = 'none';
        bookingDetails.style.display = 'none';
        renderCalendar();
      });
    });

    // Back to team picker
    if (backToTeamBtn) {
      backToTeamBtn.addEventListener('click', () => {
        calendarStep.style.display = 'none';
        teamPicker.style.display = 'block';
        // Reset sidebar to default
        if (bookingImg) { bookingImg.src = 'assets/images/tristan.png'; bookingImg.style.display = 'block'; }
        if (bookingCardName) bookingCardName.textContent = 'Tristan Domonica';
        if (bookingCardRole) bookingCardRole.textContent = 'President, 180DC Baylor';
      });
    }

    function renderCalendar() {
      calendarTitle.textContent = months[currentMonth] + ' ' + currentYear;
      prevBtn.style.visibility = (currentMonth <= 1) ? 'hidden' : 'visible';
      nextBtn.style.visibility = (currentMonth >= 1) ? 'hidden' : 'visible';
      calendarGrid.innerHTML = '';
      dayLabels.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day-label';
        el.textContent = d;
        calendarGrid.appendChild(el);
      });
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        calendarGrid.appendChild(el);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = d;
        const date = new Date(currentYear, currentMonth, d);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dayEl.classList.add('disabled');
        } else {
          dayEl.addEventListener('click', () => selectDate(d, dayEl));
        }
        if (selectedDate === d) dayEl.classList.add('selected');
        calendarGrid.appendChild(dayEl);
      }
    }

    function selectDate(d, el) {
      selectedDate = d;
      selectedTime = null;
      calendarGrid.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      timeSlotsEl.style.display = 'block';
      if (bookingDetails) bookingDetails.style.display = 'none';
      timeSlotsGrid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    }

    timeSlotsGrid.querySelectorAll('.time-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        timeSlotsGrid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        selectedTime = slot.dataset.time;
        if (bookingDetails) {
          bookingDetails.style.display = 'block';
          if (selectedInfo) {
            selectedInfo.textContent = 'February ' + selectedDate + ', 2026 at ' + selectedTime;
          }
        }
      });
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const nameInput = bookingDetails.querySelector('input[name="name"]');
        const emailInput = bookingDetails.querySelector('input[name="email"]');
        const commentsInput = bookingDetails.querySelector('textarea[name="comments"]');
        if (!nameInput.value || !emailInput.value) {
          alert('Please enter your name and email.');
          return;
        }

        const personName = nameInput.value.trim();
        const personEmail = emailInput.value.trim();
        const comments = commentsInput ? commentsInput.value.trim() : '';
        const dateStr = 'February ' + selectedDate + ', 2026';
        const timeStr = selectedTime;
        const memberFirst = selectedMember.name.split(' ')[0];

        // Build mailto to selected team member
        const subject = encodeURIComponent('Coffee Chat 180 \u2013 ' + personName);
        let body = 'Hi ' + memberFirst + ',\n\n' + personName + ' has scheduled a coffee chat for ' + dateStr + ' at ' + timeStr + '.';
        if (comments) {
          body += '\n\nThey are looking forward to talking about:\n' + comments;
        } else {
          body += '\n\nThey are looking forward to chatting with you!';
        }
        body += '\n\nReply-to: ' + personEmail + '\n\nBest,\n' + personName;
        const encodedBody = encodeURIComponent(body);

        const mailtoLink = 'mailto:' + selectedMember.email + '?subject=' + subject + '&body=' + encodedBody;
        window.open(mailtoLink, '_self');

        // Show confirmation
        calendarStep.style.display = 'none';
        if (bookingConfirmation) bookingConfirmation.style.display = 'block';
      });
    }

    if (backToCalBtn) {
      backToCalBtn.addEventListener('click', () => {
        if (bookingDetails) bookingDetails.style.display = 'none';
        selectedTime = null;
        timeSlotsGrid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      });
    }

    // Initial state
    calendarStep.style.display = 'none';
    if (bookingConfirmation) bookingConfirmation.style.display = 'none';
  }

  // --- Animated counters ---
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length) {
    const observerCounter = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          const duration = 2000;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(ease * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(tick);
          observerCounter.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(c => observerCounter.observe(c));
  }

  // --- Scroll fade-up animation ---
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observerFade = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerFade.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observerFade.observe(el));
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // --- Project modal ---
  const projectModal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const projectModalOverlay = projectModal ? projectModal.querySelector('.modal-overlay') : null;

  const projectData = {
    'mckinsey': {
      title: 'Strategic Partnership',
      client: 'McKinsey & Company Collaboration',
      desc: 'Collaborated with McKinsey to provide strategic analysis and recommendations for a local nonprofit seeking to expand their outreach program across Central Texas.',
      outcomes: ['Market analysis completed', 'Growth strategy developed', 'Implementation roadmap delivered']
    },
    'bain': {
      title: 'Operational Excellence',
      client: 'Bain & Company Initiative',
      desc: 'Evaluated operational efficiency for a social enterprise and designed long-term growth strategies to increase their community impact.',
      outcomes: ['Operational audit completed', 'Cost reduction plan', 'Sustainability framework']
    },
    'bcg': {
      title: 'Community Engagement',
      client: 'BCG Partnership',
      desc: 'Developed innovative solutions for community engagement and social impact measurement for a regional nonprofit organization.',
      outcomes: ['Engagement framework', 'Impact metrics dashboard', 'Volunteer coordination plan']
    },
    'venture': {
      title: 'Social Venture Launch',
      client: 'Student-Led Social Enterprise',
      desc: 'Student-led initiative empowering local entrepreneurs and improving livelihoods through mentorship and business planning support.',
      outcomes: ['Business plans for 5 entrepreneurs', 'Mentorship program launched', 'Community workshop series']
    }
  };

  document.querySelectorAll('.project-card[data-project]').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.project;
      const data = projectData[key];
      if (!data || !modalContent || !projectModal) return;
      modalContent.innerHTML = `
        <h2 style="margin-bottom:6px;">${data.title}</h2>
        <p style="color:var(--green-600);font-weight:600;margin-bottom:16px;">${data.client}</p>
        <p style="color:var(--gray-600);line-height:1.7;margin-bottom:20px;">${data.desc}</p>
        <h4 style="margin-bottom:10px;">Key Outcomes</h4>
        <ul style="list-style:none;">
          ${data.outcomes.map(o => `<li style="padding:4px 0 4px 22px;position:relative;color:var(--gray-600);font-size:0.92rem;"><span style="position:absolute;left:0;color:var(--green-500);font-weight:700;">✓</span>${o}</li>`).join('')}
        </ul>
      `;
      projectModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeProjectModal = () => {
    if (projectModal) {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (projectModalOverlay) projectModalOverlay.addEventListener('click', closeProjectModal);

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
});
