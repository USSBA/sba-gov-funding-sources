// Global variable to store current data provided on funding sources
var fundingSources;

// Gather up and store input element, attaching event listener
var inputZipcode = document.getElementById('zip');
inputZipcode.addEventListener('input', updateValue);

// Keep enter keystroke form from resetting input box
inputZipcode.onkeypress = function(event) {
    var key = event.charCode || event.keyCode || 0;
    if (key == 13) {
      event.preventDefault();
      updateValue(event);
    }
  }

// Function to capture zipcode
async function updateValue(event) {
    // Make sure there's a valid zipcode (5 digits)
    if (event.target.value.length === 5) {
        console.log(event.target.value);
        // Fetch data for zipcode supplied in input
        fundingSources = await fetchFundingData(event.target.value);
        updateTable(fundingSources)
    }
}

// Retrieve data from S3
function fetchFundingData(zipcode) {
    // Compose the URL for the JSON file
    var queryURL = 'https://s3.amazonaws.com/ryan.ussba.io-static/data/' + zipcode + '.json'
    return fetch(queryURL).then(function(response) {
        // The API call was successful, so check if response is valid (200)
        if (response.ok) {
            // Return the response by casting the object to JSON, sending to the .then block
            return response.json();
        } else {
            // Since the response was NOT ok, reject the promise, sending to the .catch block
            return Promise.reject(response)
        }
    }).then(function(data) {
        // data is JSON of the response
        return data;
    }).catch(function(err) {
        // err is the raw response
        console.warn(data.json());
        return data.json();
    })
}

// Translate data in JSON into DOM elements in place (without triggering a re-render)
function updateTable(data) {
    console.log('updateTable function');
    // Remove this once we paginate and transition it to take page #
    // Only take 1st 30 elements in array
    data = data.slice(0, 30);
    var i = 0;
    console.log(data);
    // Gather NodeList of all table rows
    var sourcesTableRows = document.querySelectorAll('#source-list tbody tr');
    // Iterate over all rows
    sourcesTableRows.forEach(function(row) {
        // Load 1 JSON object for updating DOM
        var dataToLoad = data[i];
        // Gather HTMLCollection of all table cells in this row
        var cells = row.children;
        // Iterate over all of these table cells <td> elements
        for (let j = 0; j < cells.length; j++) {
            // Turn elements in cell into proper Array
            var elementsInCell = Array.prototype.slice.call(cells[j].childNodes);
            // Find the anchor (link) element
            var link = elementsInCell.find(isLink);
            // Check for special fields that require anchor links be updated
            // There's an easier way to do this, but I haven't figured it out yet
            if (cells[j].dataset.key === "name") {
                // Take the URL value and make it the actual link
                link.href = dataToLoad['url'];
                // Set the innerHTML so we can include the icon easily
                link.innerHTML = dataToLoad['name'] + "<img src='./img/icon-external-link.svg'></img>";
            } else if (cells[j].dataset.key === "phone") {
                // Phone field is turned into a click-to-call tel: link
                link.href = "tel:" + dataToLoad['phone'];
                // Set the display text for the link to the raw phone number
                link.textContent = dataToLoad['phone'];
            } else if (cells[j].dataset.key === "url") {
                // Take the URL value and make it the actual link
                link.href = dataToLoad['url'];
                // Shorten to just the domain name
                link.textContent = link.hostname;
            } else {
                // Find the determine
                var contentToBeModified = elementsInCell.find(isContent);
                if (contentToBeModified) {
                    contentToBeModified.textContent = dataToLoad[cells[j].dataset.key];
                }
            }
        }
        i += 1;
    })
}

// Translate data in JSON into DOM elements in place (without triggering a re-render)
// function updateModal(data) {
//   console.log('renderModal function');
//   // Remove this once we paginate and transition it to take page #
//   // Only take 1st 30 elements in array
//   data = data.slice(0, 30);

//   console.log(data);
//   // Gather NodeList of all table rows
//   var sourcesTableRows = document.querySelectorAll('#source-list tbody tr');
//   // Iterate over all rows
//   sourcesTableRows.forEach((row) {
//       // Load 1 JSON object for updating DOM
//       var dataToLoad = data[i];
//       // Gather HTMLCollection of all table cells in this row
//       var cells = row.children;
//       // Iterate over all of these table cells <td> elements
//       for (let j = 0; j < cells.length; j++) {
//           // Turn elements in cell into proper Array
//           var elementsInCell = Array.prototype.slice.call(cells[j].childNodes);
//           // Find the anchor (link) element
//           var link = elementsInCell.find(isLink);
//           // Check for special fields that require anchor links be updated
//           // There's an easier way to do this, but I haven't figured it out yet
//           if (cells[j].dataset.key === "name") {
//               // Take the URL value and make it the actual link
//               link.href = dataToLoad['url'];
//               // Set the innerHTML so we can include the icon easily
//               link.innerHTML = dataToLoad['name'] + "<img src='./img/icon-external-link.svg'></img>";
//           } else if (cells[j].dataset.key === "phone") {
//               // Phone field is turned into a click-to-call tel: link
//               link.href = "tel:" + dataToLoad['phone'];
//               // Set the display text for the link to the raw phone number
//               link.textContent = dataToLoad['phone'];
//           } else if (cells[j].dataset.key === "url") {
//               // Take the URL value and make it the actual link
//               link.href = dataToLoad['url'];
//               // Shorten to just the domain name
//               link.textContent = link.hostname;
//           } else {
//               // Find the determine
//               var contentToBeModified = elementsInCell.find(isContent);
//               if (contentToBeModified) {
//                   contentToBeModified.textContent = dataToLoad[cells[j].dataset.key];
//               }
//           }
//       }
//       i += 1;
//   })
// }

// Test to see if an anchor element
function isLink(element) {
    return element.nodeName == 'A';
}

// Returns just the text/content, see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
function isContent(node) {
    return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
}
