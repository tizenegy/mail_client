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
  document.querySelector('#detail-view').style.display = 'none';
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
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print response
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
        // settings.set('recipients', 'card-text');
        // settings.set('body', 'card-text');

        // map html elements to styles
        let element_set = new Map();
        element_set.set('card-title', 'h5');
        element_set.set('card-subtitle mb-2 text-muted', 'h6');
        element_set.set('card-text', 'p');

        emails.forEach(email => {
          const wrapper = document.createElement('div');
          const container = document.createElement('div');
          const divider = document.createElement('div');
          divider.className = 'divider';
          container.className = 'card-body';
          if (email.read === false){
            wrapper.className = 'card mb-3';
          } else {
            wrapper.className = 'card bg-light mb-3';
          }
          wrapper.appendChild(container);
          // go to detail-view here
          wrapper.addEventListener('click', function() {
            console.log('This element has been clicked!');
            load_details(email.id);
          });
          Object.keys(email).forEach((key) => {
            const card_element = settings.get(key);
            if (card_element!==undefined){
              const html_tag = element_set.get(card_element);
              const new_element = document.createElement(html_tag);
              new_element.className = card_element;
              new_element.innerHTML = `${email[key]}`;
              if (card_element === 'card-title'){
                container.prepend(new_element);
              } else if (card_element === 'card-text') {
                divider.appendChild(new_element);
              } else {
                container.appendChild(new_element);
              }
            }
          });
          container.appendChild(divider);
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

// work in progress

function load_details(id) {
  // hide other views
  document.querySelector('#loader').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#detail-view').innerHTML = `<h3>Details</h3>`;

  // I think it is easier and faster to just pass the email object 
  // from the load_mailbox(email) to load_details(email)
  // instead of making another api call to /emails/<email_id>.
  // The passing of the id and the GET request are implemented below anyway.

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print emails
    console.log(email);
    // Show the emails
    if (isEmpty(email)){
      const element = document.createElement('div');
      element.className = 'email';
      element.innerHTML = `Wow, such empty.`;
      document.querySelector('#emails-view').append(element);
      document.querySelector('#loader').style.display = 'none';
    } else {  


        // mark this email as "read"
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
        

  // map the correct styles to email properties
  let settings = new Map();
  settings.set('subject', 'card-title');
  settings.set('sender', 'card-subtitle mb-2 text-muted');
  settings.set('timestamp', 'card-text');
  settings.set('recipients', 'card-text');
  settings.set('body', 'card-text');

  // map html elements to styles
  let element_set = new Map();
  element_set.set('card-title', 'h5');
  element_set.set('card-subtitle mb-2 text-muted', 'h6');
  element_set.set('card-text', 'p');

  const wrapper = document.createElement('div');
  const container = document.createElement('div');
  const divider = document.createElement('div');
  divider.className = 'divider';
  container.className = 'card-body';
  if (email.read === false){
    wrapper.className = 'card mb-3';
  } else {
    wrapper.className = 'card bg-light mb-3';
  }
  wrapper.appendChild(container);
  wrapper.addEventListener('click', function() {
    console.log('This element has been clicked!')
  });
  Object.keys(email).forEach((key) => {
    const card_element = settings.get(key);
    if (card_element!==undefined){
      const html_tag = element_set.get(card_element);
      const new_element = document.createElement(html_tag);
      new_element.className = card_element;
      new_element.innerHTML = `${email[key]}`;
      if (card_element === 'card-title'){
        container.prepend(new_element);
      } else if (card_element === 'card-text') {
        divider.appendChild(new_element);
      } else {
        container.appendChild(new_element);
      }
    }
  });
  container.appendChild(divider);
  document.querySelector('#detail-view').append(wrapper);
  
  document.querySelector('#loader').style.display = 'none';
}
  })}