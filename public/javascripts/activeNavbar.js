 document.addEventListener("DOMContentLoaded", function () {
    var currentPath = window.location.pathname;
    console.log(currentPath);

    // Get all the navigation links
    var navLinks = document.querySelectorAll(".nav-link");

    // Loop through the links and add the 'active' class to the one with a matching href
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  });

