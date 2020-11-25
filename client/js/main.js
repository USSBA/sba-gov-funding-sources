// Global variable to store state
var fundingSources; // The total set of data in a given zipcode
var displaySources; // The current page (displayed data)
var currentPage = 1;
var dataPerPage = 30;
var numberOfPages;

// Zipcode input element, attaching event listener
var inputZipcode = document.getElementById('zip');
inputZipcode.addEventListener('input', updateValue);

// Zipcode display element
var displayZipcode = document.getElementById('zipcode-results');
var displayNumberOfResults = document.getElementById('number-results');

// Pagination container element
var paginationList = document.querySelector('.pagination');

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
        var searchedZipcode = event.target.value;
        // Fetch data for zipcode supplied in input
        fundingSources = await fetchFundingData(searchedZipcode);
        updateDisplayData(currentPage);
        updateTable(displaySources);
        updateModal(displaySources);
        updatePagination(searchedZipcode, fundingSources);
    }
}

function updatePagination(zipcode, data) {
    displayZipcode.textContent = zipcode;
    numberOfPages = Math.ceil(data.length / 30);
    updatePage();
}

function updatePage() {
    var pagesHTML = '';
    displayNumberOfResults.textContent = displaySources.length;
    for (let i = 1; i < numberOfPages + 1; i++) {
        pagesHTML = pagesHTML + '<li class="' + ((i === currentPage) ? "current-page" : "") + '"></li>';
    }
    paginationList.innerHTML = '<span class="arrow left" onclick="previousPage()"></span>' + pagesHTML + '<span class="arrow right" onclick="nextPage()"></span>';
}

function previousPage() {
    console.log("previousPage button clicked")
    if (currentPage > 1) {
        currentPage = currentPage - 1;
        updateDisplayData(currentPage);
        updateTable(displaySources);
        updateModal(displaySources);
        updatePage();
    }
}

function nextPage() {
    console.log("nextPage button clicked")
    if (currentPage < numberOfPages) {
        currentPage = currentPage + 1;
        updateDisplayData(currentPage);
        updateTable(displaySources);
        updateModal(displaySources);
        updatePage();
    }
}

function updateDisplayData(page) {
    displaySources = fundingSources.slice(30 * (page - 1), (page * 30));
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
        // totalPages = data.length() /
        return data;
    }).catch(function(err) {
        // err is the raw response
        console.warn(data.json());
        return data.json();
    })
}

function updateTable(data) {
  // Gather NodeList of all table rows
  var sourcesTableRows = document.querySelectorAll('#source-list tbody tr');

  sourcesTableRows.forEach((row, rowIndex) => {
    if (rowIndex / 2 < data.length) {
      row.classList.remove('hidden');

      // Iterate through the data twice, as two rows belong to one organization
      // (one for basic row, another for expanded)
      const roundedIndex = Math.floor(rowIndex / 2);
      // Load 1 JSON object for updating DOM
      const dataToLoad = data[roundedIndex];
      // Gather HTMLCollection of all table cells in this row
      const cells = Array.from(row.children);
console.log('1', data)
      // Iterate over all of these table cells <td> elements
      cells.forEach((cell, cellIndex) => {
        // Turn elements in cell into proper Array
        var elementsInCell = Array.prototype.slice.call(cell.childNodes);
        // Find the anchor (link) element
        var link = elementsInCell.find(isLink);
        // Check for special fields that require anchor links be updated
        // There's an easier way to do this, but I haven't figured it out yet
        if (cell.dataset.key === "name") {
          link.href = 'javascript:void(0)';
          link.innerHTML = dataToLoad['name'];
        } else if (cell.dataset.key === "phone") {
          link.href = "tel:" + dataToLoad['phone'];
          link.textContent = dataToLoad['phone'];
        } else if (cell.dataset.key === "url") {
          link.href = dataToLoad['url'];
          link.textContent = link.hostname;
        } else {
          // For all other cases, just update the content
          var contentToBeModified = elementsInCell.find(isContent);
          if (contentToBeModified) {
            // Here's where the magic happens: JSON object's keys map to the data-key=<value> HTML attribute
            contentToBeModified.textContent = dataToLoad[cell.dataset.key];
          }
        }
      })
    } else {
        row.classList.add('hidden');
    }
  });
};

function updateModal(data) {
  const fields = [
    'organization', 'funding', 'eligibility', 'use', 'area', 'type', 'targeted'
  ];
  const fieldsWithHref = ['name', 'phone', 'url'];

  const modals = document.querySelectorAll('.popup-modal');

  modals.forEach((modal, index) => {
    if (index >= data.length) return;

    const item = data[index];

    for (const key in item) {
      const fieldElement = modal.querySelector(`[data-key=${key}]`);

      if (fields.includes(key)) {
        fieldElement.textContent = item[key];
      } else if (fieldsWithHref.includes(key)) {
        const url = key === 'phone' ? `tel:${item[key]}` : item.url;
        fieldElement.href = url;

        const text = key === 'url' ? fieldElement.hostname : item[key];
        fieldElement.textContent = text;
      }
    }
  })
}

// Test to see if an anchor element
function isLink(element) {
    return element.nodeName == 'A';
}

// Returns just the text/content, see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
function isContent(node) {
    return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
}
