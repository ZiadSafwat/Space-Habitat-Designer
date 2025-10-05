document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.navbar-links');
    const navItems = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    // Toggle menu for mobile view
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                menuToggle.setAttribute('aria-label', 'Close Menu');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-label', 'Open Menu');
            }
        });
    }

    // Handle content display for each navigation link
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Remove 'active' class from all links
            navItems.forEach(link => link.classList.remove('active'));
            // Add 'active' class to the clicked link
            e.target.classList.add('active');

            // Get the target content section ID from the data attribute
            const targetId = e.target.getAttribute('data-target');

            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));

            // Show the target content section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Close the mobile menu if it's open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            }
        });
    });
});