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

let pauseMenuHtml = `
<div class="chatBox">
<div style="display: flex; flex-direction: row; align-content: center; justify-content:center;">
  <button id="pause-btn" class="pauseBtn"><img style="height:20px;" src="assets/pause.png"></button>
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


async function fetchInstruct(prompt,context){
  const resp = await fetch('http://127.0.0.1:8000/instruct',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({prompt:prompt,context:context})
      })

      const data = await resp.json();
      const parsedPrediction = JSON.parse(data);
      return parsedPrediction
}

     
async function fetchNavigate(prompt,context){
  const resp = await fetch('http://127.0.0.1:8000/navigate',{
    method:'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({prompt:prompt,context:context})
  })

  const data = await resp.json();
  const parsedPrediction = JSON.parse(data);
  return parsedPrediction
}





function domChanged(activeTab,prompt){
  chrome.tabs.sendMessage(activeTab, {
    type: "extractDOM",
    body: "dom",
    prompt: prompt
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("DOM extraction error:", chrome.runtime.lastError);
      return [];
    }
    console.log("Full context:", JSON.stringify(response));
    return JSON.stringify(response);
  });
  return [];
}

chrome.runtime.onMessage.addListener((obj, sender, response) => {
  const { type, body, prompt } = obj;

  if (type === "elementClicked") {
    console.log("Response from contentScript:", body);
      chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete') {
          console.log('Page finished loading or URL changed to:', tab.url);
            console.log("prompt",prompt)
            // const prediction = await fetchNavigate(prompt,domChanged(tab))
            domChanged(tabId,prompt)
            const prediction = { "instructions": "Click on add widgets", "name": "Batch", "isCompleted": false };
            chrome.tabs.sendMessage(tabId, {
              type: "navigate",
              body: prediction,
              prompt: prompt
            });
          }
        
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
        const chatBox = document.getElementById("chatBox");
        const pauseMenu = document.createElement("div");
        pauseMenu.id = "pauseMenu";  // Optional: Add an ID or other attributes
        pauseMenu.innerHTML = pauseMenuHtml;  // Add content to the new div
        if (chatBox) {
          chatBox.replaceWith(pauseMenu);
          const pauseButton = document.getElementById('pause-btn');
          if(pauseButton){
           pauseButton.addEventListener('click', function(){
            console.log("asdfasdfadf")
             pauseMenu.replaceWith(chatBox);
           });
          }
        }
      chrome.tabs.sendMessage(activeTab.id, {
        type: "extractDOM",
        body: "dom"
      }, async (response) => {
        console.log(JSON.stringify({ prompt: message, context: response }));
        // const prediction = await fetchNavigate(message,response)
        const prediction = { "instructions": "Click on add widgets", "name": "View all services", "isCompleted": false };
        if (prediction) {
          chrome.tabs.sendMessage(activeTab.id, {
            type: "navigate",
            body: prediction,
            prompt: message
          });
        }

        const cloudPilot = document.getElementById("cloudPilot");
        const newCloudPilot = cloudPilot.cloneNode(true);
        const newMessage = newCloudPilot.querySelector('#cloudPilot-message');
        newMessage.textContent = prediction.instructions;
        const chatbox = document.getElementById("chatArea");
        chatbox.appendChild(newCloudPilot);
        newCloudPilot.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      })

      // });
    // }
  }
  //else{
  //   chrome.tabs.sendMessage(activeTab.id, {
  //     type: "extractDOM",
  //     body: "dom"
  //   }, async (response) => {
  //     console.log(JSON.stringify({prompt:message,context:response}))
  //     const prediction = await fetchInstruct(message,response)
  //     const cloudPilot = document.getElementById("cloudPilot");
  //     const newCloudPilot = cloudPilot.cloneNode(true);
  //     const newMessage = newCloudPilot.querySelector('#cloudPilot-message');
  //     newMessage.textContent = prediction.instructions;
  //     const chatbox = document.getElementById("chatArea");
  //     chatbox.appendChild(newCloudPilot);
  //     newCloudPilot.scrollIntoView({
  //       behavior: 'smooth',
  //       block: 'end'
  //     });
  //   });
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


