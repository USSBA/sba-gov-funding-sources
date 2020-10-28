console.log("Loaded main.js")
var sourcesTableRows = document.querySelectorAll('#source-list tbody tr')
    // var tableBody = document.querySelector('#source-list tbody')
    // Data retrieval
async function fetchFundingData(zipcode) {
    console.log("fetchFundingData for " + zipcode)
    var queryURL = 'https://s3.amazonaws.com/ryan.ussba.io-static/data/' + zipcode + '.json'
    console.log(queryURL)
    fetch(queryURL).then(function(response) {
        // The API call was successful, so check if response is valid (200)
        if (response.ok) {
            // Return the response by casting the object to JSON, sending to the .then block
            return response.json();
        } else {
            // Since the response was NOT ok, reject the promise, sending to the .catch block
            return Promise.reject(response)
        }
    }).then(function(data) {
        return updateTable(data);
    }).catch(function(err) {
        // err is the raw response
        console.warn(data.json());
        return data.json();
    })
}

var result = fetchFundingData('76132')
console.log(result)

function updateTable(data, page) {
    console.log('updateTable function')
    sourcesTableRows.forEach(function(row) {
        row.children.forEach(function(cell) {
            console.log(cell)
        })
    })

    const inputElement = document.getElementById('zip')
    inputElement.addEventListener('input', updateValue) console.log(inputElement)

    function updateValue(event) {
        // Make sure there's a valid zipcode (5 digits)
        if (event.target.value.length === 5) {
            console.log(event.target.value);
            const fundingData = fetchFundingData(event.target.value);
            console.log(fundingData);
        }
    }