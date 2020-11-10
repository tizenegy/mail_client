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
  document.querySelector('#loader').style.display = 'none';

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
  document.querySelector('#loader').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // Show the emails
      if (isEmpty(emails)){
        const element = document.createElement('div');
        element.className = 'email';
        element.innerHTML = `Wow, such empty.`;
        document.querySelector('#emails-view').append(element);
        document.querySelector('#loader').style.display = 'none';
      } else {  
        // map the correct styles to email properties
        let settings = new Map();
        settings.set('subject', 'card-title');
        settings.set('sender', 'card-subtitle mb-2 text-muted');
        settings.set('timestamp', 'card-text');
        settings.set('recipients', 'card-text');
        settings.set('body', 'card-text');
        let element_set = new Map();
        element_set.set('card-title', 'h5');
        element_set.set('card-subtitle mb-2 text-muted', 'h6');
        element_set.set('card-text', 'p');

        emails.forEach(email => {
          const wrapper = document.createElement('div');
          const container = document.createElement('div');
          container.className = 'card-body';
          wrapper.className = 'card';
          wrapper.appendChild(container);
          Object.keys(email).forEach((key) => {
            const card_element = settings.get(key);
            if (card_element!==undefined){
              console.log(card_element);
              console.log(element_set.get('card-text'));
              console.log(element_set.get(card_element));
              const key_div = document.createElement(element_set.get(card_element));
              key_div.className = card_element;
              key_div.innerHTML = `${key}: ${email[key]}`;
              container.appendChild(key_div);
            }
          });
          document.querySelector('#emails-view').append(wrapper);
          });
          document.querySelector('#loader').style.display = 'none';
      }
  });

}

function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}