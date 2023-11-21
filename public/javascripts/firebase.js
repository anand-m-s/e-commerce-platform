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
// const firebaseConfig = {
//   apiKey: "AIzaSyAYbmkCfbyyY7hWKKsbTxWTZqH8EwEAWTs",
//   authDomain: "e-commerce-ff372.firebaseapp.com",
//   projectId: "e-commerce-ff372",
//   storageBucket: "e-commerce-ff372.appspot.com",
//   messagingSenderId: "201968717019",
//   appId: "1:201968717019:web:e20ca9a3700ec9261d90fe",
//   measurementId: "G-4C36EDFLE4"
// };
let userData;
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
const loginform = document.querySelector('#signup-form')
const loginsection = document.querySelector('#login-section')
const otpsection = document.querySelector('#otp-section')
const otpform = document.querySelector('#otp-form')
const errorP = document.querySelector('.errorP')
const otpalert = document.querySelector('.otpalert')
const resendOTPButton = document.getElementById('resend-otp');
const currentURL = window.location.href;
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const nameerr = document.querySelector(".nameerr")
const emailerr = document.querySelector(".emailerr")
const passworderr = document.querySelector(".passworderr")
const phoneerr = document.querySelector(".phoneerr")
const passworderror = document.querySelector(".passworderror")
const otpErrPop = document.querySelector(".otperrpop");

let timerSeconds = 60; // Change this to the desired timer duration
let timerInterval;

// Function to start the timer
function startTimer() {
  timerSeconds = 60; // Reset the timer duration
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
    let errorMessages = [];

if (userData.Username === '' || userData.Password === '' || userData.Confirmpassword === '' || userData.phone === '' || userData.Email === '') {
    errorMessages.push("Please fill all fields");
}
if (userData.Password.length < 8) {
    errorMessages.push("Enter a strong password");
    passworderr.innerHTML = "Enter a strong password"
}
if (userData.Password !== userData.Confirmpassword) {
    errorMessages.push("Password doesn't match.");
    passworderror.innerHTML ="Password doesn't match"
}
if (userData.phone.length !== 10) {
    errorMessages.push("Please check the entered Phonenumber");
    phoneerr.innerHTML = "Please check the entered phonenumber"
}
if (emailRegex.test(userData.Email) === false) {
    errorMessages.push("Please check your entered email");
    emailerr.innerHTML ="Please check the enterd email";
}
if (!isNaN(userData.Username) || userData.Username.trim() === '') {
    errorMessages.push("Username must be a string");
    nameerr.innerHTML ="Username must be a string";
}
// Checking if there are any errors
if (errorMessages.length > 0) {
    // Displaying all error messages together
    errorP.innerHTML = "Please correct the following errors to proceed"
} else {

    const response = await fetch('/signupVerify',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(userData)
    })
    alert(response.status)
    if(response.status===200){
      const mobilenumber = '+91' + loginform.phone.value;
      const appVerifier = window.recaptchaVerifier;
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

    }else if(response.status===209){
      errorP.innerHTML = "User already exists"
    }
    // ---------------------------res.status(200).json({status:true})----------------------
    // No errors, clear error message container
    // errorP.innerHTML = "";
    // Continue with the rest of your code for the successful case
    // (code related to sending the request and handling responses)
    
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
otpform.addEventListener('submit', async (e) => {
  e.preventDefault();
  const otpInput = document.querySelector('#otp');
  const otp_number = otpform.otp.value;
    // Assuming confirmationResult is available globally
    const result = await confirmationResult.confirm(otp_number).then(async (result)=>{
      userData.phone = result.user.phoneNumber;
      const response =   await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      })
      if (response.status === 200) {
        window.location.href = '/login';
      }else if (response.status === 409) {
        clearInterval(timerInterval); // Clear the timer interval
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = 'User already exists. Please log in or use a different phone number.';
        otpErrPop.innerHTML ='<a href="/login">Login</a>';
    }  else {
        // OTP verification failed, display an error message
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = 'Incorrect OTP. Please try again.';      
    } 
    }).catch((error) => {
            // OTP confirmation failed, display an error message
            const errorMessageElement = document.getElementById('error-message');
            errorMessageElement.textContent = 'Incorrect OTP. Please try again.';
          });
})
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


