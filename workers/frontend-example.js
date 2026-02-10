/**
 * Example: Update your contact form to use the new API endpoint
 * 
 * Replace your existing form submission code in scripts.js with this approach
 */

// Inquiry Form Validation and Submission
const inquiryForm = document.querySelector('.inquiry-form');
if (inquiryForm) {
  inquiryForm.addEventListener('submit', async function(e) {
    e.preventDefault(); // Always prevent default to handle with JavaScript
    
    // Remove previous errors
    const prevErrors = inquiryForm.querySelectorAll('.form-error');
    prevErrors.forEach(el => el.remove());

    let valid = true;
    const name = inquiryForm.querySelector('#inquiry-name');
    const email = inquiryForm.querySelector('#inquiry-email');
    const phone = inquiryForm.querySelector('#inquiry-phone');
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
    
    // Phone validation
    if (!phone.value.trim()) {
      showError(phone, 'Phone is required.');
      valid = false;
    }
    
    // Message validation
    if (!message.value.trim()) {
      showError(message, 'Message is required.');
      valid = false;
    }
    
    // Turnstile validation (assumes you have turnstileVerified variable from Turnstile callback)
    if (!window.turnstileVerified) {
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
      // Get the Turnstile token (assumes you stored it in window.turnstileToken)
      const turnstileToken = window.turnstileToken;

      // Send to your new API endpoint
      const response = await fetch('https://api.mcadroofcleaning.co.uk/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          message: message.value.trim(),
          turnstileToken: turnstileToken
        })
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        showSuccessMessage(inquiryForm, result.message || 'Thank you! Your message has been sent successfully.');
        
        // Reset form
        inquiryForm.reset();
        
        // Reset Turnstile
        if (window.turnstile) {
          window.turnstile.reset();
        }
        window.turnstileVerified = false;
        window.turnstileToken = null;
        
      } else {
        // Show error message
        showError(turnstileWidget, result.error || 'An error occurred. Please try again.');
      }

    } catch (error) {
      console.error('Form submission error:', error);
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
    success.style.color = 'green';
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

// Turnstile callback functions (add these globally)
window.onTurnstileSuccess = function(token) {
  window.turnstileVerified = true;
  window.turnstileToken = token;
};

window.onTurnstileExpire = function() {
  window.turnstileVerified = false;
  window.turnstileToken = null;
};

window.onTurnstileError = function() {
  window.turnstileVerified = false;
  window.turnstileToken = null;
};
