// sidePanel.js

import { getActiveTabURL } from "./utils.js";

let isNavigate = false;
let isDisabled = false;


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

function allFramesLoaded(activeTab){
  chrome.tabs.sendMessage(activeTab.id, {
    type: "extractDOM",
    body: "dom"
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("DOM extraction error:", chrome.runtime.lastError);
      return;
    }
    console.log("Full context:", JSON.stringify(response));
  });
}

chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const { type, body } = obj;

  if (type === "elementClicked") {
    console.log("Response from contentScript:", body);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return console.error("No active tab found");
      const activeTab = tabs[0];

      // Wait for main page load
      chrome.tabs.onUpdated.addListener(function onTabUpdated(tabId, changeInfo) {
        if (tabId !== activeTab.id || changeInfo.status !== 'complete') return;
        
      chrome.webNavigation.getAllFrames({
          tabId: tabId,
      }).then(allFramesLoaded(activeTab))
        chrome.tabs.onUpdated.removeListener(onTabUpdated);
      });
    });
  }
});


async function handleSubmit() {
  const textField = document.getElementById('text-input');
  const message = textField.value.trim();
  const activeTab = await getActiveTabURL();
  if (message) {
    const newUser = document.createElement('div');
    newUser.innerHTML = userChatHtml;
    const newMessage = newUser.querySelector('#user-message');
    newMessage.textContent = message;
    const chatbox = document.getElementById("chatArea");
    chatbox.appendChild(newUser);
    textField.value = '';
    newUser.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });

    if (isNavigate) {
      chrome.tabs.sendMessage(activeTab.id, {
        type: "extractDOM",
        body: "dom"
      }, async (response) => {
        console.log(JSON.stringify({ prompt: message, context: response }));
        // const resp = await fetch('http://127.0.0.1:8000/navigate',{
        //   method:'POST',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   body:JSON.stringify({prompt:message,context:response})
        // })

        // const data = await resp.json();
        const data = { "instructions": "Click on add widgets", "name": "View all services" };
        const parsedPrediction = data; // JSON.parse(data);
        console.log(parsedPrediction);

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
        newCloudPilot.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });

        const submitButton = document.getElementById('submit-btn');
        submitButton.removeEventListener('click', handleSubmit);
        submitButton.style.backgroundColor = "grey";
      });
    }
  }else{
    chrome.tabs.sendMessage(activeTab.id, {
      type: "extractDOM",
      body: "dom"
    }, async (response) => {
      console.log(JSON.stringify({prompt:message,context:response}))
      // const resp = await fetch('http://127.0.0.1:8000/instruct',{
      //   method:'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body:JSON.stringify({prompt:message,context:response})
      // })

      // const data = await resp.json();
      const data = {"instructions": "Click on a widgets"}
      const parsedPrediction = JSON.parse(data);
      console.log(parsedPrediction);
      const cloudPilot = document.getElementById("cloudPilot");
      const newCloudPilot = cloudPilot.cloneNode(true);
      const newMessage = newCloudPilot.querySelector('#cloudPilot-message');
      newMessage.textContent = parsedPrediction.instructions;
      const chatbox = document.getElementById("chatArea");
      chatbox.appendChild(newCloudPilot);
      newCloudPilot.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    });
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


