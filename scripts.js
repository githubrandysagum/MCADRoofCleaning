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

  // Turnstile verification flag
  let turnstileVerified = false;
  let turnstileToken = null;
  
  window.onTurnstileSuccess = function(token) {
    turnstileVerified = true;
    turnstileToken = token;
  };
  
  window.onTurnstileExpire = function() {
    turnstileVerified = false;
    turnstileToken = null;
  };

  // Inquiry Form Validation and Submission
  const inquiryForm = document.querySelector('.inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async function(e) {
      e.preventDefault(); // Always prevent default to handle with JavaScript
      
      // Remove previous errors and success messages
      const prevErrors = inquiryForm.querySelectorAll('.form-error');
      prevErrors.forEach(el => el.remove());
      const prevSuccess = inquiryForm.querySelectorAll('.form-success');
      prevSuccess.forEach(el => el.remove());

      let valid = true;
      const name = inquiryForm.querySelector('#inquiry-name');
      const email = inquiryForm.querySelector('#inquiry-email');
      const message = inquiryForm.querySelector('#inquiry-message');
      const turnstileWidget = inquiryForm.querySelector('.cf-turnstile');
      
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
      // Message validation
      if (!message.value.trim()) {
        showError(message, 'Message is required.');
        valid = false;
      }
      // Turnstile validation (skip in test mode)
      if (!window.TEST_MODE && !turnstileVerified) {
        showError(turnstileWidget, 'Please complete the security verification.');
        valid = false;
      }
      
      if (!valid) {
        return;
      }

      // Get submit button and show loading state
      const submitButton = inquiryForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      try {
        // Check if we're in test mode (set by test-index.html)
        const apiUrl = window.TEST_MODE && window.TEST_API_URL 
          ? window.TEST_API_URL 
          : 'https://api.mcadroofcleaning.co.uk/inquiry';
        
        console.log('Submitting to:', apiUrl);
        
        // Send to API endpoint
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            message: message.value.trim(),
            turnstileToken: turnstileToken
          })
        });

        const result = await response.json();

        if (result.success) {
          // Clear any remaining errors before showing success
          const remainingErrors = inquiryForm.querySelectorAll('.form-error');
          remainingErrors.forEach(el => el.remove());
          
          // Show success message
          showSuccessMessage(inquiryForm, result.message || 'Thank you! Your message has been sent successfully.');
          
          // Reset form
          inquiryForm.reset();
          
          // Reset Turnstile
          if (window.turnstile) {
            window.turnstile.reset();
          }
          turnstileVerified = false;
          turnstileToken = null;
          
        } else {
          // Clear any remaining success messages before showing error
          const remainingSuccess = inquiryForm.querySelectorAll('.form-success');
          remainingSuccess.forEach(el => el.remove());
          
          // Show error message
          showError(turnstileWidget, result.error || 'An error occurred. Please try again.');
        }

      } catch (error) {
        console.error('Form submission error:', error);
        
        // Clear any remaining success messages before showing error
        const remainingSuccess = inquiryForm.querySelectorAll('.form-success');
        remainingSuccess.forEach(el => el.remove());
        
        showError(turnstileWidget, 'Network error. Please check your connection and try again.');
      } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
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
    
    function showSuccessMessage(form, message) {
      const success = document.createElement('div');
      success.className = 'form-success';
      success.style.color = '#155724';
      success.style.fontSize = '1.1em';
      success.style.padding = '1em';
      success.style.marginTop = '1em';
      success.style.backgroundColor = '#d4edda';
      success.style.border = '1px solid #c3e6cb';
      success.style.borderRadius = '4px';
      success.textContent = message;
      form.appendChild(success);

      // Remove after 5 seconds
      setTimeout(() => {
        success.remove();
      }, 5000);
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

    // Pause video when scrolled out of view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If video is not intersecting (out of view) and is playing
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
          playButton.style.display = 'block';  // Show play button
          pauseButton.style.display = 'none';  // Hide pause button
        }
      });
    }, {
      threshold: 0.5  // Pause when less than 50% of video is visible
    });

    // Start observing the video
    observer.observe(video);
  });

  // Hide/Show CTA Banner on scroll (mobile only)
  let scrollTimer = null;
  let isScrolling = false;
  const ctaBanner = document.querySelector('.cta-banner');
  
  if (ctaBanner && window.innerWidth < 768) {
    window.addEventListener('scroll', function() {
      // User is scrolling - hide banner
      if (!isScrolling) {
        isScrolling = true;
        ctaBanner.classList.add('hide-on-scroll');
      }
      
      // Clear previous timer
      clearTimeout(scrollTimer);
      
      // Set a new timer to show banner after user stops scrolling
      scrollTimer = setTimeout(function() {
        isScrolling = false;
        ctaBanner.classList.remove('hide-on-scroll');
      }, 600); // Show banner 600ms after scrolling stops
    });
  }
});
