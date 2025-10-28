/* ========================================
   LANDING PAGE JAVASCRIPT
   Interactive functionality for Homepage + Blog Index
   ======================================== */

// ========================================
// 1. PRICING TOGGLE (Monthly vs. Annual)
// ========================================

function initPricingToggle() {
  const toggle = document.getElementById('pricing-toggle')
  if (!toggle) return

  toggle.addEventListener('change', (e) => {
    const isAnnual = e.target.checked
    
    // Get all monthly and annual price elements
    const monthlyPrices = document.querySelectorAll('.price-monthly')
    const annualPrices = document.querySelectorAll('.price-annual')
    
    if (isAnnual) {
      // Show annual prices (20% discount)
      monthlyPrices.forEach(el => el.style.display = 'none')
      annualPrices.forEach(el => el.style.display = 'inline')
    } else {
      // Show monthly prices
      monthlyPrices.forEach(el => el.style.display = 'inline')
      annualPrices.forEach(el => el.style.display = 'none')
    }
  })
}

// ========================================
// 2. BLOG SEARCH FUNCTIONALITY
// ========================================

function initBlogSearch() {
  const searchInput = document.getElementById('blog-search')
  if (!searchInput) return

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const blogCards = document.querySelectorAll('.blog-card')
    
    blogCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase()
      const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase()
      const category = card.querySelector('.blog-category').textContent.toLowerCase()
      
      const matches = title.includes(searchTerm) || 
                     excerpt.includes(searchTerm) || 
                     category.includes(searchTerm)
      
      if (matches) {
        card.style.display = 'block'
        // Add subtle animation on show
        card.style.animation = 'fadeInUp 0.3s ease-out'
      } else {
        card.style.display = 'none'
      }
    })
    
    // Update visible count
    const visibleCards = Array.from(blogCards).filter(card => card.style.display !== 'none')
    updateResultsCount(visibleCards.length, blogCards.length)
  })
}

// ========================================
// 3. BLOG CATEGORY FILTER
// ========================================

function initBlogFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn')
  if (filterButtons.length === 0) return

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'))
      
      // Add active class to clicked button
      button.classList.add('active')
      
      // Get selected category
      const category = button.dataset.category
      const blogCards = document.querySelectorAll('.blog-card')
      
      blogCards.forEach(card => {
        const cardCategory = card.querySelector('.blog-category').textContent.toLowerCase().replace(/\s+/g, '_')
        
        if (category === 'all' || cardCategory.includes(category)) {
          card.style.display = 'block'
          card.style.animation = 'fadeInUp 0.3s ease-out'
        } else {
          card.style.display = 'none'
        }
      })
      
      // Update visible count
      const visibleCards = Array.from(blogCards).filter(card => card.style.display !== 'none')
      updateResultsCount(visibleCards.length, blogCards.length)
    })
  })
}

// ========================================
// 4. UPDATE RESULTS COUNT (Helper)
// ========================================

function updateResultsCount(visible, total) {
  let countElement = document.getElementById('blog-results-count')
  
  // Create count element if it doesn't exist
  if (!countElement) {
    countElement = document.createElement('p')
    countElement.id = 'blog-results-count'
    countElement.style.textAlign = 'center'
    countElement.style.color = 'var(--color-text-secondary)'
    countElement.style.fontSize = '0.938rem'
    countElement.style.marginTop = '1rem'
    
    const blogGrid = document.querySelector('.blog-grid')
    if (blogGrid) {
      blogGrid.parentNode.insertBefore(countElement, blogGrid)
    }
  }
  
  // Update text
  if (visible === total) {
    countElement.textContent = `Showing all ${total} articles`
  } else if (visible === 0) {
    countElement.textContent = 'No articles found. Try a different search or filter.'
  } else {
    countElement.textContent = `Showing ${visible} of ${total} articles`
  }
}

// ========================================
// 5. SMOOTH SCROLL TO SECTION
// ========================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')
      
      // Don't smooth scroll if href is just "#"
      if (href === '#') return
      
      e.preventDefault()
      
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    })
  })
}

// ========================================
// 6. INTERSECTION OBSERVER (Animate on scroll)
// ========================================

function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
        observer.unobserve(entry.target) // Only animate once
      }
    })
  }, observerOptions)
  
  // Observe all elements that should animate on scroll
  const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .pricing-card, .problem-card')
  animateElements.forEach(el => observer.observe(el))
}

// ========================================
// 7. TRACK BUTTON CLICKS (Analytics)
// ========================================

function trackButtonClick(buttonText, destination) {
  // Google Analytics 4 event tracking
  if (typeof gtag === 'function') {
    gtag('event', 'button_click', {
      'button_text': buttonText,
      'destination': destination
    })
  }
  
  // Facebook Pixel event tracking
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', {
      content_name: buttonText
    })
  }
  
  console.log(`📊 Tracked: ${buttonText} → ${destination}`)
}

// Add click tracking to all CTAs
function initAnalyticsTracking() {
  const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary')
  
  ctaButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const buttonText = this.textContent.trim()
      const destination = this.getAttribute('href') || 'unknown'
      trackButtonClick(buttonText, destination)
    })
  })
}

// ========================================
// 8. EXIT INTENT POPUP (Optional)
// ========================================

function initExitIntent() {
  let popupShown = false
  
  document.addEventListener('mouseleave', (e) => {
    // Only trigger if mouse leaves from top of page and popup hasn't been shown
    if (e.clientY < 10 && !popupShown) {
      popupShown = true
      showExitPopup()
    }
  })
}

function showExitPopup() {
  // Create popup HTML
  const popup = document.createElement('div')
  popup.id = 'exit-popup'
  popup.innerHTML = `
    <div class="popup-overlay">
      <div class="popup-content">
        <button class="popup-close" onclick="closeExitPopup()">✕</button>
        <h3>Wait! Before You Go...</h3>
        <p>Get 3 Free Facebook Post Templates (No Signup Required)</p>
        <form id="exit-form" onsubmit="submitExitForm(event)">
          <input type="email" placeholder="Enter your email" required>
          <button type="submit" class="btn btn-primary">Send Me the Templates</button>
        </form>
        <p style="font-size: 0.813rem; color: var(--color-text-secondary); margin-top: 0.5rem;">
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  `
  
  // Add styles
  const style = document.createElement('style')
  style.textContent = `
    #exit-popup .popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    }
    
    #exit-popup .popup-content {
      background-color: var(--color-slate);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-lg);
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      position: relative;
      animation: slideUp 0.4s ease-out;
    }
    
    #exit-popup .popup-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s ease;
    }
    
    #exit-popup .popup-close:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    #exit-popup h3 {
      color: var(--color-text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    
    #exit-popup p {
      color: var(--color-text-secondary);
      margin-bottom: 1.5rem;
    }
    
    #exit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    #exit-form input {
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-md);
      background-color: var(--color-dark);
      color: var(--color-text-primary);
      font-size: 1rem;
    }
    
    #exit-form input:focus {
      outline: none;
      border-color: var(--color-primary);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  
  document.head.appendChild(style)
  document.body.appendChild(popup)
}

function closeExitPopup() {
  const popup = document.getElementById('exit-popup')
  if (popup) {
    popup.style.animation = 'fadeOut 0.3s ease-out'
    setTimeout(() => popup.remove(), 300)
  }
}

function submitExitForm(e) {
  e.preventDefault()
  const email = e.target.querySelector('input[type="email"]').value
  
  // Track conversion
  trackButtonClick('Exit Popup Submit', 'email_capture')
  
  // TODO: Send email to your backend/email service
  console.log('📧 Email captured:', email)
  
  // Show success message
  const popupContent = document.querySelector('#exit-popup .popup-content')
  if (popupContent) {
    popupContent.innerHTML = `
      <h3>✅ Check Your Email!</h3>
      <p>We've sent you 3 free templates. Check your inbox (and spam folder) in the next few minutes.</p>
      <button class="btn btn-primary" onclick="closeExitPopup()">Close</button>
    `
  }
}

// ========================================
// 9. LAZY LOAD IMAGES (Performance)
// ========================================

function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]')
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.add('loaded')
        observer.unobserve(img)
      }
    })
  })
  
  images.forEach(img => imageObserver.observe(img))
}

// ========================================
// 10. INITIALIZE ALL FUNCTIONS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Landing page scripts loaded')
  
  // Initialize all features
  initPricingToggle()
  initBlogSearch()
  initBlogFilter()
  initSmoothScroll()
  initScrollAnimations()
  initAnalyticsTracking()
  initLazyLoading()
  
  // Optional: Exit intent popup (enable if you want lead capture)
  // initExitIntent()
  
  console.log('✅ All features initialized')
})

// ========================================
// 11. UTILITY FUNCTIONS
// ========================================

// Debounce function (for search input optimization)
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Get URL parameter
function getURLParameter(name) {
  return new URLSearchParams(window.location.search).get(name)
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

