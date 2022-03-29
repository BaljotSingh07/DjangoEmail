document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById("archive").addEventListener("click", archive_unarchive);
  document.getElementById("reply").addEventListener("click", reply);
  
  load_mailbox("inbox")
  //sending email
  document.getElementById("compose-form").onsubmit = function(){
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body:  document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        let message = document.createElement("div");
        if(result.error){
          message.classList = "alert alert-danger";
          document.getElementById("compose-form").append(message); 
          message.innerHTML = result.error;
        } else{
          message.classList = "alert alert-success";
          load_mailbox("sent")
          document.getElementById("emails-view").append(message);
          message.innerHTML = result.message; 
        }
    });    
    return false;
  }
});

function reply(){
  compose_email();
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  fetch(`/emails/${document.getElementById("archive").dataset.id}`)
  .then(response => response.json())
  .then(email => {   
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    document.querySelector('#compose-body').value = `on ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    document.querySelector('#compose-recipients').disabled = true;
    document.querySelector('#compose-subject').disabled = true;
  });
}

function archive_unarchive(){ 
  fetch(`/emails/${this.dataset.id}`)
  .then(response => response.json())
  .then(email => {
    fetch(`/emails/${this.dataset.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !email.archived
      })
    }) 
    load_mailbox("inbox");   
  });
}

function show_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      if(email.subject == ""){
        document.querySelector('#email-subject').innerHTML = `<h3>(No subject)</h3>`;
      }else{
        document.querySelector('#email-subject').innerHTML = `<h3>${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}</h3>`;
      }
      document.getElementById("email-from").innerHTML = "From: " + email.sender.charAt(0).toUpperCase() + email.sender.slice(1);
      document.getElementById("email-recipients").innerHTML = "Recipients: " + email.recipients;
      document.getElementById("email-body").innerHTML = email.body;
      document.getElementById("email-time").innerHTML = email.timestamp;
      document.getElementById("archive").dataset.id = id;
      if(email.archived == true){
        document.getElementById("archive").innerHTML = "Unarchive";
      }else{
        document.getElementById("archive").innerHTML = "Archive";
      }
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.getElementById("email").style.display = "block";
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })      
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.getElementById("email").style.display = "none";
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.getElementById("email").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    // ... do something else with emails ...
    emails.forEach(email => {
      let div = document.createElement("div")
      div.classList=`d-flex bd-highlight`;
      div.innerHTML = `<a href="#" onclick="show_email(${email.id})" style="max-height:100px; overflow:hidden; background-color: inherit" class=" list-group-item list-group-item-action" aria-current="true">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${email.sender.charAt(0).toUpperCase() + email.sender.slice(1)}</h5>
        <small>${email.timestamp}</small>
      </div>
      <p class="mb-1">${email.subject}</p>
      <small>${email.body}</small>
    </a>`
    div.style.borderRadius = "100px"
    div.style.margin = "2px"
    if(email.read == true){
      div.style.backgroundColor = "WhiteSmoke";
    } else{
      div.style.backgroundColor = "white";
    }
    document.querySelector('#emails-view').append(div);
    });
  });

}