(() => {
  fetchDataAndRender();
})();

  function fetchFundingData () {
    const csv = "https://s3.amazonaws.com/ryan.ussba.io-static/sample-data-large.csv";

    return new Promise((resolve, reject) => {
      Papa.parse(csv, {
        delimiter: ";",
        download: true,
        header: true,
        newline: "",
        worker: true,
        complete: response => {
            resolve(response.data);
            // You can access the data here
            // console.log('1', results);
            // let filteredResults = findSourceByState("California (CA)");
            // filteredResults.forEach(element => {
            //     console.log(element.name)
            // });
        },
        error(err) {
          reject(err)
        }
      })
    });

    // console.log('1111',results)
    // return results;
  }

  function renderResults(results) {
    document.getElementById("source-list").innerHTML = "";
    const table = document.getElementById("source-list");
    const data = Object.keys(results[0]);

    generateTableHead(table, data);
    generateTable(table, results);
  }

  function generateTableHead(table, data) {
      let thead = table.createTHead();
      let row = thead.insertRow();
      for (let key of data) {
          let th = document.createElement("th");
          let text = document.createTextNode(key);
          th.appendChild(text);
          row.appendChild(th);
      }
  }

  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (key in element) {
          let cell = row.insertCell();
          let text = document.createTextNode(element[key]);
          cell.appendChild(text);
      }
    }
  }

  async function fetchDataAndRender() {
    const fundingData = await fetchFundingData();
    renderResults(fundingData);
  }

  function findSourceByState(state) {
      return results.filter(data => data.location === state);
  }

async function findSourceByZipcode(zip, data) {
  const results = data.filter(item => {
    if("Zipcodes" in item) {
      return item.Zipcodes.split(',').includes(zip);
    }
  })

  renderResults(results)
};

// })();
