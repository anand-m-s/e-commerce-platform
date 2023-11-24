import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-analytics.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
// import { showAlert, hideAlert } from './javascript';

// const firebaseConfig = {
//     apiKey: "AIzaSyDHL5ZqPrD0QFOd6dvlDP0W5ZD1eegmZrs",
//     authDomain: "cartblizz-7db91.firebaseapp.com",
//     projectId: "cartblizz-7db91",
//     storageBucket: "cartblizz-7db91.appspot.com",
//     messagingSenderId: "1005464021454",
//     appId: "1:1005464021454:web:9d16aee50ef5a9a37ce39f",
//     measurementId: "G-RC3JKG85T5"
// };
const firebaseConfig = {
  apiKey: "AIzaSyAYbmkCfbyyY7hWKKsbTxWTZqH8EwEAWTs",
  authDomain: "e-commerce-ff372.firebaseapp.com",
  projectId: "e-commerce-ff372",
  storageBucket: "e-commerce-ff372.appspot.com",
  messagingSenderId: "201968717019",
  appId: "1:201968717019:web:e20ca9a3700ec9261d90fe",
  measurementId: "G-4C36EDFLE4"
};
let userData;
let responseData
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth();
const loginform = document.querySelector('#forgot-form')
const loginsection = document.querySelector('#forgot-section')
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
const resetForm = document.querySelector("#password-reset")
const resetform = document.querySelector("#resetPasswordForm");
const hemail =document.querySelector("#hiddenemail")

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

if (currentURL.includes('/forgotpassword')) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'submitBtn', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
    });
    loginform.addEventListener('submit', async (e) => {
        e.preventDefault();
        userData = {
            Email: loginform.email.value,
        };
        hemail.value=userData.Email;
        let errorMessages = [];

        if (emailRegex.test(userData.Email) === false) {
            errorMessages.push("Please check your entered email");
            emailerr.innerHTML = "Please check the enterd email";
        }
        if (errorMessages.length > 0) {
            // Displaying all error messages together
            errorP.innerHTML = "Please correct the following errors to proceed"
        } else {
            console.log(userData);
            const response = await fetch('/passwordreset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.Email }),
            });

            // alert(response.status)
            if (response.status === 200) {
                responseData = await response.json();
                console.log(responseData);
                const mobilenumber = responseData.phoneNumber;
                const appVerifier = window.recaptchaVerifier;
                signInWithPhoneNumber(auth, mobilenumber, appVerifier)
                    .then((confirmationResult) => {
                        // SMS sent. Prompt user to type the code from the message, then sign the
                        // user in with confirmationResult.confirm(code).
                        window.confirmationResult = confirmationResult;
                        loginsection.style.display = 'none';
                        otpsection.style.display = 'block';

                        startTimer();
                        otpform.addEventListener('submit', async (e) => {
                            e.preventDefault();
                            const otpInput = document.querySelector('#otp');
                            const otp_number = otpform.otp.value;
                            // Assuming confirmationResult is available globally
                            const result = await confirmationResult.confirm(otp_number).then(async (result) => {
                                console.log(result);
                                if (result.user.phoneNumber) {

                                    otpsection.style.display = 'none';
                                    otpsection.style.display = 'none';
                                    resetForm.style.display = 'block';
                                    console.log(resetForm);
                                    
                                    // resetform.addEventListener('submit', (e) => {
                                    //     e.preventDefault();
                                    //     const formData = new FormData(resetform)
                                    //     formData.append('userData', userData)
                                    //     console.log(formData);
                                    //     fetch('/resetpassword', {
                                    //         method: 'POST',
                                    //         headers: {
                                    //             'Content-Type': 'application/json',
                                    //         },
                                    //         body: JSON.stringify({ formData }),
                                    //     }).then(res=>console.log(res))
                                    
                                    // })
                                    // await fetch('/resetpassword', {
                                    //     method: 'POST',
                                    //     headers: {
                                    //         'Content-Type': 'application/json',
                                    //     },
                                    //     body: JSON.stringify({ formData }),
                                    // })
                                }

                            }).catch((error) => {
                                // OTP confirmation failed, display an error message
                                const errorMessageElement = document.getElementById('error-message');
                                errorMessageElement.textContent = 'Incorrect OTP. Please try again.';
                            });
                        })
                    })
                    .catch((error) => {
                        // Error; SMS not sent
                        errorP.innerHTML = "Sorry, Can't send OTP. Please check your mobile number";
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    });
            }
            // ---------------------------res.status(200).json({status:true})----------------------
            // No errors, clear error message container
            // errorP.innerHTML = "";
            // Continue with the rest of your code for the successful case
            // (code related to sending the request and handling responses)

            //   resendOTPButton.addEventListener('click', async () => {
            //     clearInterval(timerInterval)
            //     signInWithPhoneNumber(auth, responseData.phoneNumber, appVerifier)
            //         .then((confirmationResult) => {
            //           // SMS sent. Prompt user to type the code from the message, then sign the
            //           // user in with confirmationResult.confirm(code).
            //           window.confirmationResult = confirmationResult;
            //           startTimer();
            //         })

            //   });

        }
    });

}


// LOGIN OTP VERIFICATION


