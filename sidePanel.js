// sidePanel.js

import { getActiveTabURL } from "./utils.js";


let dom_elements = [];

function autoExpand(field) {
    field.style.height = 'auto'; // Reset the height
    field.style.height = Math.max(field.scrollHeight, 60) + 'px'; // Set it to the scrollHeight
  }
  
  // Attach the event listener to the textarea
  document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('text-input');
    if (textField) {
      textField.addEventListener('input', () => autoExpand(textField));
    }
  });


const submitButton = document.getElementById('submit-btn');
const textField = document.getElementById('text-input');




async function handleSubmit() {

  const message = textField.value.trim();
  const activeTab = await getActiveTabURL();
  if (message) {
    chrome.tabs.sendMessage(activeTab.id, {
      type: "extractDOM",
      body:"dom"
    }, (response) => {
      dom_elements = response;
    });
    console.log("Dom elements",dom_elements);
    console.log('Message Submitted:', message);

    

    textField.value = '';
  } else {
    console.log('Textarea is empty!');
  }
}

// Event listener for the submit button
submitButton.addEventListener('click', handleSubmit);

// Optional: Handle "Enter" key to submit the message
textField.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent default Enter behavior (new line)
    handleSubmit();
  }
});
