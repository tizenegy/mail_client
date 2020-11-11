document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => {compose_email("")});
  // Form submit buttons
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault();
    send_email();
  });
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#loader').style.display = 'none';

  let rec = "";
  let sub = "";
  let bod = "";
  console.log(id);

  if (id !== ""){ 
    fetch(`/emails/${parseInt(id)}`)
    .then(response => response.json())
    .then(email => {
      if (isEmpty(email)){
        console.log("email is empty.");
      } else {  
        console.log(email);
        rec = email.sender;
        sub = email.subject;
        bod = email.body;
      }
      sub = sub.startsWith('Re:') ? sub : "Re: ".concat(sub);
      document.querySelector('#compose-recipients').value = rec;
      document.querySelector('#compose-subject').value = `${sub}`;
      document.querySelector('#compose-body').value = `\r\r------------\rOn ${email.timestamp} ${email.sender} wrote:\r${bod}`;
    })
  } else {
    document.querySelector('#compose-recipients').value = "";
    document.querySelector('#compose-subject').value = "";
    document.querySelector('#compose-body').value = "";
  }
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
        element.className = 'card-body';
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

        // build cards for each email
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
          // put the details into the card
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
          // insert the buttons below
          if (mailbox === "sent"){

          }else{
          const archive_button = document.createElement('button');
          archive_button.className = 'btn btn-primary';
          if (mailbox === "archive"){
            archive_button.innerHTML = 'Unarchive';
          }else{
            archive_button.innerHTML = 'Archive mail';
          }
          
          // add listeners to buttons
          archive_button.addEventListener('click', function(e) {
            console.log('This button has been clicked!');
            mark_un_archived(email.id, email.archived);
            e.stopPropagation();
            document.querySelector('#loader').style.display = 'block';
            setTimeout(() => load_mailbox('inbox'), 1500);
          });
          divider.appendChild(archive_button);
        }

          
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
      mark_un_read(email.id);      

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

      // build cards for each email
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
      // wrapper.addEventListener('click', function() {
      //   console.log('This element has been clicked!')
      // });
      Object.keys(email).forEach((key) => {
        const card_element = settings.get(key);
        if (card_element!==undefined){
          const html_tag = element_set.get(card_element);
          const new_element = document.createElement(html_tag);
          new_element.className = card_element;
          new_element.innerText = `${email[key]}`;
          if (card_element === 'card-title'){
            container.prepend(new_element);
          } else if (card_element === 'card-text') {
            divider.appendChild(new_element);
          } else {
            container.appendChild(new_element);
          }
        }
      });

      // add buttons
      const archive_button = document.createElement('button');
      const reply_button = document.createElement('button');
      archive_button.className = 'btn btn-primary mr-2';
      reply_button.className = 'btn btn-primary mr-2';
      if (email.archived === true){
        archive_button.innerHTML = 'Unarchive';
      }else{
        archive_button.innerHTML = 'Archive mail';
      }
      reply_button.innerHTML = 'Reply';
          
      // add listeners to buttons
      reply_button.addEventListener('click', function(e) {
        id = email.id;
        console.log(`before passing: ${id}`);
        compose_email(id);
        e.stopPropagation();
      });
      archive_button.addEventListener('click', function(e) {
        mark_un_archived(email.id, email.archived);
        e.stopPropagation();
        document.querySelector('#loader').style.display = 'block';
        setTimeout(() => load_mailbox('inbox'), 1500);
      });
      divider.appendChild(archive_button);
      divider.appendChild(reply_button);

      container.appendChild(divider);
      document.querySelector('#detail-view').append(wrapper);
      
      document.querySelector('#loader').style.display = 'none';
    }
})}

function mark_un_archived(id, archive){
  console.log(`changing archived status of email: ${id}`);
  console.log(`original status: ${archive}`);
  archive = !archive;
  // change status
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
    archived: archive
    }) 
  })
  console.log(`archived status changed`);
}

function mark_un_read(id){
  console.log(`changing read status of email: ${id}`);
  read = true;
  // change status
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
    read: read
    }) 
  })
  console.log(`read status changed`);
}