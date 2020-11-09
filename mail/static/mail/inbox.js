document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Form submit buttons
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault();
    send_email();
  });
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

async function send_email(){
  const response = await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  });
  const json = await response.json();
  load_mailbox('sent');
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // get data from api
  url = '/emails/sent';
  let emails = async (url) => {
    let response = await fetch(url);
    let result = await response.json();
  }

  // fetch('/emails/sent')
  // .then(response => response.json())
  // .then(json => console.log(json))
  // // build list
  // .then(json => {
  //   const emails = tryParseJSON(`${json}`);
  // });
  
  // // example json for testing
  // const emails = tryParseJSON(
  //   '{"eBooks":[{"language":"Pascal","edition":"third"},{"language":"Python","edition":"four"},{"language":"SQL","edition":"second"}]}'
  // );

  emails = tryParseJSON(`${emails}`);
  
  emails.eBooks.forEach(email => {
  const element = document.createElement('div');
  element.innerHTML = `Entry: ${email.subject}`;
  // element.innerHTML = JSON.stringify(email);
  element.addEventListener('click', function() {
      console.log('This element has been clicked!')
  });
  document.querySelector('#emails-view').append(element);
  });

}

function tryParseJSON (jsonString){
  try {
      var o = JSON.parse(jsonString);

      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object", 
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === "object") {
        console.log('it is a json!');
        return o;
      }
  }
  catch (e) {
    console.log('problem parsing json!');
   }
  return false;
};