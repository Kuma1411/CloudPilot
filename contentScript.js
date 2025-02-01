(() => {


  function extractDOM() {
    var visibleElements = [];
    function extractFromContext(context) {
      var elements = context.querySelectorAll('button, a, input, select, textarea');
      
      elements.forEach(function(element) {
        var textContent = element.textContent || element.value;
 
        if (!textContent && element.children.length > 0) {
          element.childNodes.forEach(function(child) {
            if (child.nodeType === Node.TEXT_NODE) {
              textContent = child.textContent.trim();
              visibleElements.push(textContent.trim());
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              textContent = child.textContent.trim();
            }
          });
        }

        if (textContent && textContent.trim()) {
          visibleElements.push(textContent.trim());
        }
      });
    }

    extractFromContext(document.body);
  

    var iframes = document.querySelectorAll('iframe');
    iframes.forEach(function(iframe) {
      try {
  
        var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  
        if (iframeDocument) {
          extractFromContext(iframeDocument.body);
        }
      } catch (e) {
        console.warn('Could not access iframe content: ', e);
      }
    });
  
    return visibleElements;
  }
  
 
  function injectGlowStyle(documentToInject) {
    const style = document.createElement('style');
    style.innerHTML = `
      .glow {
        /* width: 220px;
        height: 50px; */
        border: none;
        outline: none;
        /* color: #fff; */
        /* background: #111; */
        cursor: pointer;
        position: relative;
        z-index: 0;
        border-radius: 10px;
    }
    
    .glow:before {
        content: '';
        background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
        position: absolute;
        top: 0px;
        left: 0px;
        background-size: 400%;
        z-index: -1;
        filter: blur(5px);
        width: calc(100% + 1px);
        height: calc(100% + 1px);
        animation: glowing 8s linear infinite;
        opacity: 1
        border-radius: 10px;
    }
    
    .glow:after {
        z-index: -1;
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: #fff;
        left: 0;
        top: 0;
        border-radius: 10px;
    }
    
    @keyframes glowing {
      0% { background-position: 0 0; }
      50% { background-position: 400% 0; }
      100% { background-position: 0 0; }
    }`;

    documentToInject.head.appendChild(style);
  }






  function findElementByTextInDOM(searchText) {
    searchText = searchText.trim().toLowerCase(); 
    let elementFound = null;
  
    // Function to search within a given context (document or iframe content)
    function searchInContext(context) {
      const elements = context.querySelectorAll('button, a, input, select, textarea');
  
      for (let element of elements) {
        let textContent = element.textContent || element.value;
  
        if (textContent) {
          textContent = textContent.trim().toLowerCase();
          if (textContent.includes(searchText)) {
            return element;
          }
        }
  
        if (element.children.length > 0) {
          for (let child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().toLowerCase().includes(searchText)) {
              return element;
            }
          }
        }
      }
  
      return null;
    }
  
    // Search in the main document body
    elementFound = searchInContext(document.body);
  
    // If not found in the main document, search in iframes
    if (!elementFound) {
      const iframes = document.querySelectorAll('iframe');
      for (let iframe of iframes) {
        try {

          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  
          if (iframeDocument) {
            elementFound = searchInContext(iframeDocument.body);
            if (elementFound) {
              injectGlowStyle(iframeDocument)
              return elementFound; 
            }
          }
        } catch (e) {
          console.warn('Could not access iframe content: ', e);
        }
      }
    }
    injectGlowStyle(document)
    return elementFound; 
  }
  


  function openHiddenNavIfNeeded(element) {
    const navElements = document.querySelectorAll('nav[aria-hidden="true"]');
    navElements.forEach(nav => {

      if (element && nav.contains(element)) {
        const navbar = document.querySelector('button[aria-label="Open navigation drawer"]');
        if(navbar){
          navbar.click();
        }
      }
    });
  }


  function openHiddenDropDownIfNeeded(element) {
    const drpdwn = document.querySelectorAll('div[class="globalNav-2254"]');
    drpdwn.forEach(dropdown => {

      if (element && dropdown.contains(element)) {
        const drpdwnButton = document.querySelector('button[aria-controls="menu--services"]');
        if(drpdwnButton){
          drpdwnButton.click();
        }
      }
    });
  }


  function removeGlow() {
    // Remove glow class from the main document
    const elements = document.querySelectorAll('.glow');
    elements.forEach((element) => {
      element.classList.remove('glow');
    });

    // Remove glow class from elements inside iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      try {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDocument) {
          const elementsInIframe = iframeDocument.querySelectorAll('.glow');
          elementsInIframe.forEach((element) => {
            element.classList.remove('glow');
          });
        }
      } catch (e) {
        return;
      }
    });
  }

  // function loadNewDOM() {
  //   window.addEventListener('load', function() {
  //     const newDOM = extractDOM();
  //   });
  //   return newDOM;
  // }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, body } = obj;
  
    if (type === "navigate") {
      if (body) {
        const element = findElementByTextInDOM(body);
        if (element) {
          removeGlow();
          element.classList.add('glow');
  
          // Add event listener to the element
          element.addEventListener('click', function handleClick(event) {
            console.log("Button Clicked!!!");
  
            // Send a message back to the side panel
            chrome.runtime.sendMessage({
              type: "elementClicked",
              body: "Button is clicked!!!"
            });
  
            // Remove the event listener after the first click
            element.removeEventListener('click', handleClick);
          });
  
          openHiddenNavIfNeeded(element);
          openHiddenDropDownIfNeeded(element);
  
          if (element.getBoundingClientRect().top >= window.innerHeight || element.getBoundingClientRect().bottom <= 0) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
    if (type === "extractDOM") {
      response(extractDOM()); 
    }

  });
  

})();
