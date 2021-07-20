// Global variable to store state
var fundingSources; // The total set of data in a given zipcode
var displaySources; // The current page (displayed data)
var currentPage = 1;
var dataPerPage = 30;
var numberOfPages;

window.onload = function() {
  document.getElementById('zip').value = '';
}

function resetState() {
  fundingSources = undefined
  displaySources = undefined
  currentPage = 1;
  dataPerPage = 30;
  numberOfPages = undefined
}

// Function to capture zipcode
async function updateValue(value) {
  // Make sure there's a valid zipcode (5 digits)
  const zipCode = value || document.getElementById('zip').value

  if (zipCode.length === 5) {
    resetState();
    // Fetch data for zipcode supplied in input
    fundingSources = await fetchMultipleFundingData(zipCode);
    updateDisplayData(currentPage);
    updateTable(displaySources);
    updateModal(displaySources);
    updatePagination(zipCode, fundingSources);
    renderNationFundingOptionsLink(zipCode);
  }
  return false;
}

function renderNationFundingOptionsLink (zipCode) {
  const nationalFundingsLink = document.getElementById('national-fundings-link');

  if (zipCode === '99999') {
    nationalFundingsLink.classList.remove('show');
    nationalFundingsLink.classList.add('hide');
    document.getElementById('zip').value = '';
  } else {
    nationalFundingsLink.classList.add('show');
    nationalFundingsLink.classList.remove('hide');
  }
}

function updatePagination(zipcode, data) {
  const zipCodeLabel = document.getElementById('zipcode-results');
  const displayZipcode = zipcode === '99999' ? 'National Funding Options' : zipcode

  zipCodeLabel.textContent = displayZipcode;
  numberOfPages = Math.ceil(data.length / 30);
  updatePage();
}

function updatePage() {
  const displayNumberOfResults = document.getElementById('number-results');
  const paginationList = document.querySelector('.pagination');

  let pagesHTML = '';

  displayNumberOfResults.textContent = displaySources.length;

  for (let pageNumber = 1; pageNumber < numberOfPages + 1; pageNumber++) {
    const ariaLabelText = currentPage !== pageNumber ? `go to page ${pageNumber}` : `you are currently on page ${currentPage}`;

    pagesHTML = `${pagesHTML}<li aria-label="${ariaLabelText}" class="${((currentPage === pageNumber) ? "current-page" : "")}" onclick="goToPage(event)">${pageNumber}</li>`;
  }

  const leftArrowStatus = currentPage > 1 ? 'arrow' : 'arrow-disabled';
  const leftArrowButtonHoverEffect = leftArrowStatus === 'arrow' ? 'pagination-arrow-button-hover' : '';
  const leftArrowButtonAriaLabelText = leftArrowStatus === 'arrow' ? 'go to previous page' : 'you are currently on the first page. this button is disabled';
  const disableLeftArrowButton = leftArrowStatus === 'arrow-disabled' ? 'disabled' : ''

  const leftArrowButton = `<button aria-label="${leftArrowButtonAriaLabelText}" class="pagination-arrow-button ${leftArrowButtonHoverEffect}" onclick="previousPage()" ${disableLeftArrowButton}><span aria-hidden="true" class="${leftArrowStatus} left"></span></button>`;

  const rightArrowStatus = currentPage < numberOfPages ? 'arrow' : 'arrow-disabled';
  const rightArrowButtonHoverEffect = rightArrowStatus === 'arrow' ? 'pagination-arrow-button-hover' : '';
  const rightArrowButtonAriaLabelText = rightArrowStatus === 'arrow' ? 'go to next page' : 'you are currently on the last page. this button is disabled';
  const disableRightArrowButton = rightArrowStatus === 'arrow-disabled' ? 'disabled' : ''

  const rightArrowButton = `<button aria-label="${rightArrowButtonAriaLabelText}" class="pagination-arrow-button ${rightArrowButtonHoverEffect}" onclick="nextPage()" ${disableRightArrowButton}><span class="${rightArrowStatus} right"></span></button>`;

  paginationList.innerHTML = `${leftArrowButton}${pagesHTML}${rightArrowButton}`;
}

function previousPage() {
  if (currentPage > 1) {
    currentPage = currentPage - 1;
    updateDisplayData(currentPage);
    updateTable(displaySources);
    updateModal(displaySources);
    updatePage();
  }
}

function nextPage() {
  if (currentPage < numberOfPages) {
    currentPage = currentPage + 1;
    updateDisplayData(currentPage);
    updateTable(displaySources);
    updateModal(displaySources);
    updatePage();
  }
}

function goToPage(event) {
  const clickedPageNumber = parseInt(event.target.innerHTML);

  currentPage = clickedPageNumber;
  updateDisplayData(currentPage);
  updateTable(displaySources);
  updateModal(displaySources);
  updatePage();
}

function updateDisplayData(page) {
  displaySources = fundingSources.slice(30 * (page - 1), (page * 30));
}

// Retrieve data from S3
function fetchFundingData(zipcode) {
  // Compose the URL for the JSON file
  var queryURL = 'https://www.sba.gov/covid-19-funding-sources/data/' + zipcode + '.json'
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
    return data.json();
  })
}

function fetchMultipleFundingData(zipcode) {
  if (zipcode === '99999') {
    return fetchFundingData('99999')
  }

  const userEnteredZipCode = fetchFundingData(zipcode);
  const nationalFundingZipCode = fetchFundingData('99999');

  return Promise.all([userEnteredZipCode, nationalFundingZipCode])
  .then(function(data){
    combinedData = [...data[0], ...data[1]];

    sortedResult = combinedData.sort((a,b) => {
      const aOrganizationName = a.organization.toLowerCase()
      const bOrganizationName = b.organization.toLowerCase();

      if (aOrganizationName < bOrganizationName) {
          return -1;
      }
      if (aOrganizationName > bOrganizationName) {
          return 1;
      }
      return 0;
    })

    return sortedResult
  })
  .catch(function(err){
      console.error('err', err);
  });
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
