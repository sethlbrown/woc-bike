// Mobile navigation toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the menu button and mobile menu elements
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');
  const mobileNavLinks = document.querySelectorAll('#mobile-menu a');
  
  // Menu is initially closed
  let isMenuOpen = false;
  
  // Toggle menu function
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    
    // Toggle visibility of the mobile menu
    mobileMenu.classList.toggle('hidden', !isMenuOpen);
    mobileMenu.classList.toggle('block', isMenuOpen);
    
    // Toggle hamburger/close icons
    hamburgerIcon.classList.toggle('hidden', isMenuOpen);
    hamburgerIcon.classList.toggle('inline-flex', !isMenuOpen);
    closeIcon.classList.toggle('hidden', !isMenuOpen);
    closeIcon.classList.toggle('inline-flex', isMenuOpen);
  }
  
  // Add click event listener to the menu button
  menuButton.addEventListener('click', toggleMenu);
  
  // Add escape key listener to close the menu
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isMenuOpen) {
      toggleMenu();
    }
  });
  
  // Add click event listeners to all mobile nav links to close menu when clicked
  mobileNavLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      if (isMenuOpen) {
        toggleMenu();
      }
    });
  });
});