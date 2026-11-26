/**
 * CSE Prep PH — closed-tester sign-up form.
 *
 * How to use:
 * 1. Open https://script.google.com while signed into the Google account that
 *    owns the Play Console.
 * 2. New project → paste this file → Run → createTesterForm.
 * 3. Approve the permissions prompt.
 * 4. Open View → Logs. Copy the form URL, edit URL, and response Sheet URL.
 *
 * The form does not contain the Play opt-in link. Add tester emails to Play
 * Console first, then email the opt-in link only to those testers.
 */
function createTesterForm() {
  var form = FormApp.create('CSE Prep PH — Closed Tester Sign-up');

  form.setDescription(
    'CSE Prep PH is a new offline reviewer for the Philippine Civil Service Exam ' +
    '(Professional and Subprofessional). I need 20 Android testers to use a ' +
    'pre-release build for 14 days and report bugs before the public launch.\n\n' +
    'Requirements:\n' +
    '• Android phone\n' +
    '• The Google account you use in the Play Store\n' +
    '• Install the app and keep it for 14 days\n' +
    '• A few minutes of honest feedback\n\n' +
    'The build is free, contains Google test ads, and is not the final release. ' +
    'You can leave the test at any time. Not affiliated with the CSC.\n' +
    'Privacy: https://nikkorod04.github.io/cseprep-ph/privacy-policy.html'
  );

  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setConfirmationMessage(
    'Thanks! Your email will be added to the closed test within 24–48 hours.\n\n' +
    'Watch for an email with your Play opt-in link. Open that link on the ' +
    'Android phone signed into the Play Store with the email you entered.\n\n' +
    'The test runs for 14 days. Please keep the app installed and send feedback ' +
    'through the feedback form in the email.'
  );

  form
    .addTextItem()
    .setTitle('Name or nickname')
    .setRequired(true);

  var email = form
    .addTextItem()
    .setTitle('Google Play email')
    .setHelpText(
      'Use the exact Google account signed into the Play Store on your Android ' +
      'phone. This is usually a Gmail address. Do not enter your Facebook email ' +
      'unless it is also your Play account.'
    )
    .setRequired(true);
  email.setValidation(
    FormApp.createTextValidation().requireTextIsEmail().build()
  );

  form
    .addCheckboxItem()
    .setTitle('Is this the Google account signed into the Play Store on your phone?')
    .setChoiceValues(['Yes, this is my Play Store account'])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Android phone brand and model')
    .setHelpText('Example: Samsung Galaxy A54, Xiaomi Redmi Note 13, Pixel 7')
    .setRequired(true);

  form
    .addListItem()
    .setTitle('Android version')
    .setHelpText('Settings → About phone → Android version')
    .setChoiceValues([
      'Android 10',
      'Android 11',
      'Android 12',
      'Android 13',
      'Android 14',
      'Android 15',
      'Android 16',
      'Android 17',
      'Not sure',
    ])
    .setRequired(true);

  form
    .addTextItem()
    .setTitle('Country')
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Can you install the app and keep it installed for 14 days?')
    .setChoiceValues(['Yes', 'No'])
    .setRequired(true);

  form
    .addMultipleChoiceItem()
    .setTitle('Which exam are you preparing for?')
    .setChoiceValues([
      'Professional',
      'Subprofessional',
      'Both',
      'Not taking it yet',
    ]);

  form
    .addTextItem()
    .setTitle('Facebook name or profile link')
    .setHelpText('Optional. Helps match form entries to group conversations.')
    .setRequired(false);

  form
    .addParagraphTextItem()
    .setTitle('Anything we should test on your device?')
    .setRequired(false);

  form
    .addCheckboxItem()
    .setTitle('Consent')
    .setChoiceValues([
      'I agree to receive emails about this closed test.',
      'I understand this is a pre-release build with Google test ads.',
      'I will not post the opt-in link publicly.',
    ])
    .setRequired(true);

  var sheet = SpreadsheetApp.create('CSE Prep PH — Tester Sign-ups');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  Logger.log('FORM: ' + form.getPublishedUrl());
  Logger.log('EDIT: ' + form.getEditUrl());
  Logger.log('SHEET: ' + sheet.getUrl());
}
