document.addEventListener('DOMContentLoaded', function () {
    // Select the form element
    const addressForm = document.querySelector('form');

    // Add an event listener to the form for the submit event
    addressForm.addEventListener('submit', function (event) {
        // Prevent the form from submitting by default
        event.preventDefault();

        // Validate the form inputs
        if (validateForm()) {
            // If the form is valid, submit it
            addressForm.submit();
        }
    });

    // Function to validate the form inputs
    function validateForm() {
        // Get form inputs
        const fullName = document.getElementById('fullName').value;
        const addressLine = document.getElementById('addressline1').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value;
        const country = document.getElementById('country').value;
        const phone = document.getElementById('phone').value;

        // Perform validation checks (you can customize these checks)
        if (fullName.trim() === '') {
            alert('Please enter your full name.');
            return false;
        }

        if (addressLine.trim() === '') {
            alert('Please enter your address.');
            return false;
        }

        if (city.trim() === '') {
            alert('Please enter your city.');
            return false;
        }

        if (state.trim() === '') {
            alert('Please enter your state.');
            return false;
        }

        if (pincode.trim() === '' || isNaN(pincode)) {
            alert('Please enter a valid pincode.');
            return false;
        }

        if (country.trim() === '') {
            alert('Please enter your country.');
            return false;
        }

        if (phone.trim() === '' || isNaN(phone)) {
            alert('Please enter a valid phone number.');
            return false;
        }

        // If all checks pass, the form is valid
        return true;
    }
});