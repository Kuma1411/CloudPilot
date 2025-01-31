// sidePanel.js

import { getActiveTabURL } from "./utils.js";




function autoExpand(field) {
    field.style.height = 'auto'; // Reset the height
    field.style.height = Math.max(field.scrollHeight, 60) + 'px'; // Set it to the scrollHeight
  }
  



async function handleSubmit() {
    const textField = document.getElementById('text-input');
  const message = textField.value.trim();
  const activeTab = await getActiveTabURL();
  if (message) {
    chrome.tabs.sendMessage(activeTab.id, {
      type: "extractDOM",
      body:"dom"
    }, async (response) => {
      console.log(JSON.stringify({prompt:message,context:response}))
      const resp = await fetch('http://127.0.0.1:8000/predict',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body:JSON.stringify({prompt:message,context:response})
      })
  
      const data = await resp.json();
      console.log("model output",data);
      if (resp.ok) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: "navigate",
          body: data.prediction
        });
      }
      textField.value = '';
    });

  } else {
    console.log('Textarea is empty!');
  }
}


document.addEventListener('DOMContentLoaded', () => {

  const submitButton = document.getElementById('submit-btn');

  const textField = document.getElementById('text-input');
  if (textField) {
    textField.addEventListener('input', () => autoExpand(textField));
  }

  submitButton.addEventListener('click', handleSubmit);


  textField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  });
});


