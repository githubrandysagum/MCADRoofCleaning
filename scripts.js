// scripts.js - MCAD Roof Cleaning
// Handles play/pause for videos in the Why Moss section

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle: close menu when a link is clicked
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Prevent body scroll when menu is open
  if (menuToggle) {
    menuToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  if (menuToggle && navLinks.length) {
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.checked = false;
        document.body.style.overflow = '';
      });
    });
  }

  // Scroll Spy: Update active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
  
  function updateActiveNav() {
    let current = '';
    const scrollPosition = window.scrollY + 100; // Offset for fixed navbar
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === '#' + current) {
        item.classList.add('active');
      }
    });
  }
  
  // Run on scroll and on load
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Initial check

  // Hero Image Slideshow - DISABLED
  /*
  const heroImageContainer = document.querySelector('.hero-image-bg');
  const heroBeforeImage = document.querySelector('.hero-before-image-bg');
  
  // Array of before/after image pairs
  const imageSlides = [
    {
      before: './images/roof-before.jpg',
      after: './images/roof-after.jpg'
    },
    {
      before: './images/patio-before.jpg',
      after: './images/patio-after.jpg'
    },
    {
      before: './images/render-before.jpg',
      after: './images/render-after.jpg'
    }
  ];
  
  let currentSlideIndex = 0;
  
  function changeHeroImages() {
    if (heroImageContainer && heroBeforeImage) {
      currentSlideIndex = (currentSlideIndex + 1) % imageSlides.length;
      
      // Add fade effect
      heroImageContainer.style.opacity = '0';
      heroBeforeImage.style.opacity = '0';
      
      setTimeout(() => {
        // Change background images
        heroImageContainer.style.backgroundImage = `url('${imageSlides[currentSlideIndex].before}')`;
        heroBeforeImage.style.backgroundImage = `url('${imageSlides[currentSlideIndex].after}')`;
        
        heroImageContainer.style.opacity = '1';
        heroBeforeImage.style.opacity = '1';
      }, 300);
    }
  }
  
  // Set initial styles
  if (heroImageContainer) {
    heroImageContainer.style.transition = 'opacity 0.3s ease-in-out';
  }
  if (heroBeforeImage) {
    heroBeforeImage.style.transition = 'opacity 0.3s ease-in-out';
  }
  
  // Change images every 5 seconds
  setInterval(changeHeroImages, 5000);
  */

  // Sticky Navbar on scroll (non-mobile only) - DISABLED
  /*
  const navbar = document.querySelector('.navbar');
  const aboutSection = document.getElementById('about');
  const heroSection = document.getElementById('home');
  
  function handleStickyNav() {
    // Only apply sticky on non-mobile screens (751px and above)
    if (window.innerWidth > 750 && navbar && aboutSection) {
      // Calculate when the about section enters the viewport
      const aboutRect = aboutSection.getBoundingClientRect();
      const scrollPosition = window.scrollY;
      
      // Trigger when about section is near the top of viewport (within 200px)
      const shouldBeSticky = aboutRect.top <= 200;
      
      if (shouldBeSticky) {
        navbar.classList.add('sticky');
      } else {
        navbar.classList.remove('sticky');
      }
    } else if (navbar) {
      // Remove sticky class on mobile
      navbar.classList.remove('sticky');
    }
  }
  
  // Run on scroll, resize, and on load
  window.addEventListener('scroll', handleStickyNav);
  window.addEventListener('resize', handleStickyNav);
  handleStickyNav(); // Initial check
  */

  // Inquiry Form Validation
  const inquiryForm = document.querySelector('.inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', function(e) {
      // Remove previous errors
      const prevErrors = inquiryForm.querySelectorAll('.form-error');
      prevErrors.forEach(el => el.remove());

      let valid = true;
      const name = inquiryForm.querySelector('#inquiry-name');
      const email = inquiryForm.querySelector('#inquiry-email');
      // Name validation
      if (!name.value.trim()) {
        showError(name, 'Name is required.');
        valid = false;
      }
      // Email validation
      if (!email.value.trim()) {
        showError(email, 'Email is required.');
        valid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        valid = false;
      }
      if (!valid) {
        e.preventDefault();
      }
    });
    function showError(input, message) {
      const error = document.createElement('div');
      error.className = 'form-error';
      error.style.color = 'red';
      error.style.fontSize = '0.98em';
      error.style.marginTop = '0.2em';
      error.textContent = message;
      input.parentNode.appendChild(error);
    }
  }

    // Smooth scroll for Inquire Now buttons
    const scrollBtns = document.querySelectorAll('.scroll-to-inquiry');
    if (scrollBtns.length) {
      scrollBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
          const inquirySection = document.getElementById('inquiry');
          if (inquirySection) {
            e.preventDefault();
            inquirySection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    }
  // Select all play, pause buttons, and videos
  const playButtons = document.querySelectorAll('.play-button');
  const pauseButtons = document.querySelectorAll('.pause-button');
  const videos = document.querySelectorAll('.whymossvideo');

  // Initially hide the pause button and show the play button
  videos.forEach((video, index) => {
    const playButton = playButtons[index];
    const pauseButton = pauseButtons[index];

    // Show the play button and hide the pause button when the video is paused
    playButton.style.display = 'block';
    pauseButton.style.display = 'none';

    // Play button event listener
    playButton.addEventListener('click', () => {
      video.play();
      playButton.style.display = 'none';  // Hide play button
      pauseButton.style.display = 'block'; // Show pause button
    });

    // Pause button event listener
    pauseButton.addEventListener('click', () => {
      video.pause();
      playButton.style.display = 'block';  // Show play button
      pauseButton.style.display = 'none';  // Hide pause button
    });
  });
});
