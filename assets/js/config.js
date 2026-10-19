/* Edit wedding data here. +02:00 is the Madrid offset on 2 October 2027.
   The explicit offset makes the countdown identical in every visitor's timezone. */
window.Wedding = window.Wedding || {};
window.Wedding.config = Object.freeze({
  date: '2027-10-02T13:00:00+02:00',
  timeZone: 'Europe/Madrid',
  // Add an audio file to assets/audio/ and set its relative path here.
  musicSrc: '',
  musicVolume: 0.35,
  // Pega aquí la URL /exec tras desplegar apps-script/Code.gs como aplicación web.
  appsScriptUrl: ''
});
