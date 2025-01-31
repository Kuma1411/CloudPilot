// sidePanel.js

import { getActiveTabURL } from "./utils.js";

let isNavigate = false;


let userChatHtml = `
<div style="display: flex; align-items: flex-end; flex-direction: column; width: 100%; margin-top: 14px; margin-bottom: 14px;" id="user">
<div class="user">
  <div style="font-size: 10px; margin-bottom: 3px;">User</div>
<div style="font-size: 12px;" id="user-message"></div>
</div>
</div>
`

function autoExpand(field) {
    field.style.height = 'auto'; // Reset the height
    field.style.height = Math.max(field.scrollHeight, 60) + 'px'; // Set it to the scrollHeight
  }
  


function handleNavigate(){
  if(isNavigate){
    const navigateButton = document.getElementById('navigate-btn');
    navigateButton.style.boxShadow = "";
    isNavigate = false;
  }else{
    const navigateButton = document.getElementById('navigate-btn');
    navigateButton.style.boxShadow = "0 8px 16px rgba(169, 169, 169, 0.8), 0 12px 30px rgba(169, 169, 169, 0.5)";
    isNavigate = true;
  }
}





async function handleSubmit() {
  const textField = document.getElementById('text-input');
  const message = textField.value.trim();
  const activeTab = await getActiveTabURL();
  if (message) {
    const newUser = document.createElement('div');
    newUser.innerHTML = userChatHtml;
    const newMessage = newUser.querySelector('#user-message');
    newMessage.textContent = message
    const chatbox = document.getElementById("chatArea");
    chatbox.appendChild(newUser);
    textField.value = '';
   if(isNavigate){
    chrome.tabs.sendMessage(activeTab.id, {
      type: "extractDOM",
      body:"dom"
    }, async (response) => {
      console.log(JSON.stringify({prompt:message,context:response}))
      const resp = await fetch('http://127.0.0.1:8000/navigate',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({prompt:message,context:response})
      })
  
      const data = await resp.json();
      const parsedPrediction = JSON.parse(data.prediction);
      console.log(parsedPrediction)
      if (parsedPrediction) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: "navigate",
          body: parsedPrediction.name
        });
      }
      const cloudPilot = document.getElementById("cloudPilot");
      const newCloudPilot = cloudPilot.cloneNode(true);
      const newMessage = newCloudPilot.querySelector('#cloudPilot-message');
      newMessage.textContent = parsedPrediction.instructions;
      const chatbox = document.getElementById("chatArea");
      chatbox.appendChild(newCloudPilot);
    });
  }else{
    const resp = await fetch('http://127.0.0.1:8000/instruct',{
      method:'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({prompt:message,context:response})
    })

    const data = await resp.json();
    const parsedPrediction = JSON.parse(data.prediction);
    console.log(parsedPrediction);
    const cloudPilot = document.getElementById("cloudPilot");
    const newCloudPilot = cloudPilot.cloneNode(true);
    const newMessage = newCloudPilot.querySelector('#cloudPilot-message');
    newMessage.textContent = parsedPrediction.instructions;
    const chatbox = document.getElementById("chatArea");
    chatbox.appendChild(newCloudPilot);
  }

  } else {
    console.log('Textarea is empty!');
  }
}






document.addEventListener('DOMContentLoaded', () => {

  const submitButton = document.getElementById('submit-btn');
  submitButton.addEventListener('click', handleSubmit);


  const navigateButton = document.getElementById('navigate-btn');
  navigateButton.addEventListener('click',handleNavigate);
  
  
  const textField = document.getElementById('text-input');
  if (textField) {
    textField.addEventListener('input', () => autoExpand(textField));
  }
  textField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  });
});


