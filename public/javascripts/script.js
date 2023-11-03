
// const firebaseConfig = {
//   apiKey: "AIzaSyDHL5ZqPrD0QFOd6dvlDP0W5ZD1eegmZrs",
//   authDomain: "cartblizz-7db91.firebaseapp.com",
//   projectId: "cartblizz-7db91",
//   storageBucket: "cartblizz-7db91.appspot.com",
//   messagingSenderId: "1005464021454",
//   appId: "1:1005464021454:web:9d16aee50ef5a9a37ce39f",
//   measurementId: "G-RC3JKG85T5"
// };

//   // Initialize Firebase
// const app = initializeApp(firebaseConfig);

//   let sign_up = document.querySelector("#signup");
//   let message = document.querySelector('#otperror');
//   let message_value = document.querySelector('.message');

//   window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('submitBtn', {
//     'size': 'invisible',
//     'callback': (response) => {
//       // reCAPTCHA solved, allow signInWithPhoneNumber.
//       console.log("CAPTCHA VERIFIED");
//     }
//   });

//   sign_up.addEventListener('submit',(e)=>{
//     e.preventDefault();
//     let phone_num = "+91"+ sign_up.phone.value; 
//     const appVerifier = window.recaptchaVerifier
//     firebase.auth().signInWithPhoneNumber(phone_num, appVerifier)
//     .then((confirmationResult) => {
//       console.log("otp sent succesfully");
//       window.confirmationResult = confirmationResult;
//       // ...
//     }).catch((error) => {
//         message.style.display = "block";
//         message_value.innerText = error.message;
        
//     });
//   })