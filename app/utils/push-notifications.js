import Firebase from 'npm:firebase';

const firebaseConfig = {
  // TODO fill in from slack
};

// TODO : uncomment after filling in firebase config
// Firebase.initializeApp(firebaseConfig);
//
// const messaging = Firebase.messaging();
//
// messaging.onMessage(function(payload) {
//   console.log('payload', payload);
// });
//
// export function getPermission(onSuccess) {
//   messaging
//     .requestPermission()
//     .then(function() {
//       console.log('Notification permission granted.');
//       return messaging.getToken();
//     })
//     .then(function(token) {
//       console.log('got token', token);
//       if (onSuccess) {
//         onSuccess(token);
//       }
//     })
//     .catch(function(err) {
//       console.log('Unable to get permission to notify.', err);
//       return null;
//     });
// }
