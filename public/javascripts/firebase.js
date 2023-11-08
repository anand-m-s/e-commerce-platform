import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
// import { showAlert, hideAlert } from './javascript';

const firebaseConfig = {
  apiKey: "AIzaSyDHL5ZqPrD0QFOd6dvlDP0W5ZD1eegmZrs",
  authDomain: "cartblizz-7db91.firebaseapp.com",
  projectId: "cartblizz-7db91",
  storageBucket: "cartblizz-7db91.appspot.com",
  messagingSenderId: "1005464021454",
  appId: "1:1005464021454:web:9d16aee50ef5a9a37ce39f",
  measurementId: "G-RC3JKG85T5"
};
let userData;
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
const loginform = document.querySelector('#signup-form')
const loginsection = document.querySelector('#login-section')
const otpsection = document.querySelector('#otp-section')
const otpform = document.querySelector('#otp-form')
const errorP = document.querySelector('#passwordError')
const otpalert = document.querySelector('.otpalert')
const resendOTPButton = document.getElementById('resend-otp');
const currentURL = window.location.href;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

let timerSeconds = 120; // Change this to the desired timer duration
let timerInterval;

// Function to start the timer
function startTimer() {
  timerSeconds = 120; // Reset the timer duration
  document.getElementById('resend-otp').style.display = 'none';
  document.getElementById('timer-text').style.display = 'block';
  const timerElement = document.getElementById('timer');

  timerInterval = setInterval(function () {
    timerElement.textContent = timerSeconds;
    timerSeconds--;

    if (timerSeconds < 0) {
      clearInterval(timerInterval);
      document.getElementById('timer-text').style.display = 'none';
      document.getElementById('resend-otp').style.display = 'block';
    }
  }, 1000);
}

if (currentURL.includes('/signup')) {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, 'submitBtn', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });
  loginform.addEventListener('submit', async (e) => {
    e.preventDefault();
    userData = {
      Username: loginform.username.value,
      Password: loginform.password.value,
      Confirmpassword: loginform.confirmPassword.value,
      phone: loginform.phone.value,
      Email: loginform.email.value,
    };
  
    // VALIDATION
    if (userData.Username === '' || userData.Password === '' || userData.Confirmpassword === '' || userData.phone === '' || userData.Email === '') {
      errorP.innerHTML = "Please fill all fields";
    } else if (userData.Password.length < 8) {
      errorP.innerHTML = "Enter a strong password";
    } else if (userData.Password !== userData.Confirmpassword) {
      errorP.innerHTML = "Password doesn't match.";
    } else if (userData.phone.length !== 10) {
      errorP.innerHTML = "Please check the entered number";
    } else if (emailRegex.test(userData.Email) === false) {
      errorP.innerHTML = "Please check your entered email";
    } else {
      const mobilenumber = '+91' + loginform.phone.value;
      const appVerifier = window.recaptchaVerifier;
  
      // Use a single fetch request to send user data and request OTP
      await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      })
      .then((response) => {
        if (response.status === 400) {
          window.location.href = '/login';
          alert('Please login, Already signedIn');
        } else if (response.status === 200) {
          signInWithPhoneNumber(auth, mobilenumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              loginsection.style.display = 'none';
              otpsection.style.display = 'block';
              startTimer();
            })
            .catch((error) => {
              // Error; SMS not sent
              errorP.innerHTML = "Sorry, Can't send OTP. Please check your mobile number";
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            });
        }
      });
      resendOTPButton.addEventListener('click', async () => {
        clearInterval(timerInterval)
        signInWithPhoneNumber(auth, mobilenumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              startTimer();
            })
        
      });

    }
  });
  otpform.addEventListener('submit', (e) => {
    e.preventDefault();
    const otpInput = document.querySelector('#otp');
    let otp_number = otpform.otp.value;
    confirmationResult.confirm(otp_number).then(async (result) => {
      userData.phone = result.user.phoneNumber;
      console.log(userData);
      window.location.href = '/login';
      // Now, instead of sending data again, you can add the logic to handle OTP verification.
    }).catch((error) => {
      // OTP confirmation failed, display an error message
      const errorMessageElement = document.getElementById('error-message');
      errorMessageElement.textContent = 'Incorrect OTP. Please try again.';
    });
  });
}

else {
  const mobileLoginSection = document.getElementById('mobile-login-section')
  const mobileLoginForm = document.querySelector('#mobile-login-form')
  const otpLoginSection = document.querySelector('#otp-login-section')
  const otpLoginForm = document.querySelector('#otp-login-form')
  const loginotpalert = document.querySelector('.loginotpalert')
  const badnumalert = document.querySelector('.badnumalert')
  let mobilenumber
  window.recaptchaVerifiers = new RecaptchaVerifier(auth, 'submitPhone', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
    }
  });

  mobileLoginForm.addEventListener('submit', (e) => {

    e.preventDefault();
    mobilenumber = mobileLoginForm.mobilelogininput.value;
    const appVerifier = window.recaptchaVerifiers;
    fetch('/otplogin', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mobilenumber })
    })
      .then((response) => {
        const loginnumber = '+91' + mobilenumber
        if (response.status == 400) {
          // window.location.reload()
          badnumalert.innerHTML = "Looks like you are new here, please Signup"
        } else if (response.status == 200) {
          signInWithPhoneNumber(auth, loginnumber, appVerifier)
            .then((confirmationResult) => {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              mobileLoginSection.style.display = 'none';
              otpLoginSection.style.display = 'block';
              // ...
            }).catch((error) => {
              // Error; SMS not sent
              // ...
              console.log(error)
            });
        }
      })
  })
  otpLoginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    let otp_numberL = otpLoginForm.digit.value
    confirmationResult.confirm(otp_numberL).then(async (result) => {
      // User signed in successfully.
      const user = result;
      await fetch('/loginsession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobilenumber }),
      }).then(() => {
        window.location.href = '/';
      }).catch((err) => {
        console.log(err)
      })

    }).catch((error) => {
      console.log(error)
    });
  })
}


// LOGIN OTP VERIFICATION


