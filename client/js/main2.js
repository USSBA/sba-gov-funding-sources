console.log("Loaded main.js");

// Global variable to store current data provided on funding sources
var fundingSources;

// Gather up and store input element, attaching event listener
var inputElement = document.getElementById('zip');
inputElement.addEventListener('input', updateValue);

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

function updateTable(data) {
    console.log('updateTable function');
    // Remove this once we paginate and transition it to take page #
    // Only take 1st 30 elements in array
    data = data.slice(0, 30);
    var i = 0;
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
            // Turn child NodeList into proper Array
            var elementsInCell = Array.prototype.slice.call(cells[j].childNodes);
            // Check for special fields that require anchor links be updated
            if (cells[j].dataset.key === "name") {
                console.log("Found a name field!");
                // Find the anchor (link) element
                var link = elementsInCell.find(isLink);
                // Take the URL value and make it the actual link
                link.href = dataToLoad['url'];
                // Set the innerHTML so we can include the icon easily
                link.innerHTML = dataToLoad['name'] + "<img src='./img/icon-external-link.svg'></img>";
            } else if (cells[j].dataset.key === "phone") {
                var link = elementsInCell.find(isLink);
                link.href = "tel:" + dataToLoad['phone'];
                link.textContent = dataToLoad['phone'];
            } else if (cells[j].dataset.key === "url") {
                var link = elementsInCell.find(isLink);
                link.href = dataToLoad['url'];

            } else {
                cells[j].textContent = dataToLoad[cells[j].dataset.key];
            }

            // There's a way to do this more cleanly, but it will require thinking
            // console.log(elementsInCell);
            // var contentInCell = elementsInCell.find(isContent);
            // contentInCell.textContent = dataToLoad[cells[j].dataset.key];

            // if (elementsInCell.find(isLink)) {
            //     var link = elementsInCell.find(isLink)
            //     link.href = dataToLoad['url'];
            //     if (cells[j].dataset.key === "phone") {
            //         link.href = "tel:" + link.href;
            //     }
            //     if (cells[j].dataset.key === "url") {
            //         link.textContent = link.hostname;
            //     }
            // }
        }
        i += 1;
    })
}

function isLink(element) {
    return element.nodeName == 'A';
}

function isContent(element) {
    return element.classList == 'content';
}