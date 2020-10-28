var sourcesTableBody = document.querySelector('#source-list tbody')

function createArrow() {

    return newArrow;
}

var loadData = function () {
    fetch('https://s3.amazonaws.com/ryan.ussba.io-static/99999.json').then(function (response) {
        // The API call was successful, so check if response is valid (200)
        if (response.ok) {
            // Return the response by casting the object to JSON, sending to the .then block
            return response.json();
        } else {
            // Since the response was NOT ok, reject the promise, sending to the .catch block
            return Promise.reject(response)
        }
    }).then(function (data) {
        // delete the current search results
        sourcesTableBody.querySelectorAll('*').forEach(function (node) {
            node.remove()
        })
        // data is the JSONified response
        data.forEach(function (item) {
            // Create a new row in the table's body for each element in the JSON
            var newRow = document.createElement('tr');
            sourcesTableBody.append(newRow);
            // Populate that new row with columns containing data
            for (var key in item) {
                // Create the basic table structure with all columns
                var newColumn = document.createElement('td');

                newRow.appendChild(newColumn);

                // Check for special columns
                if (key === 'name') {
                    // If it's the name column, then create an anchor element using the url value
                    // var newArrow = document.createElement('i');
                    // newArrow.setAttribute('class','arrow right');
                    // newColumn.appendChild(newArrow);
                    var newLink = document.createElement('a');
                    newLink.href = item['url'];
                    newLink.textContent = item['name'];
                    newColumn.appendChild(newLink);
                }
                else if (key === 'url') {
                    // If it's the url column, then create an anchor element but shorten the link text to the domain name
                    var newLink = document.createElement('a');
                    newLink.href = item['url'];
                    newLink.textContent = newLink.hostname;
                    newColumn.appendChild(newLink)
                } else {
                    // Not a special field that needs to be transformed, so just assign value to textContent
                    newColumn.textContent = item[key];
                }
            }
        })
        return data;
    }).catch(function (err) {
        // err is the raw response
        console.warn(data.json());
    })
}

loadData();