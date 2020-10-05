(() => {
  const csv = "https://s3.amazonaws.com/ryan.ussba.io-static/data-trimmed2.csv";
  let results = [];
  const csvData = Papa.parse(csv, {
      delimiter: ";",
      download: true,
      header: true,
      newline: "",
      worker: true,
      complete: response => {
          results = response.data;
          // You can access the data here
          console.log(results)
          // let filteredResults = findSourceByState("California (CA)");
          // filteredResults.forEach(element => {
          //     console.log(element.name)
          // });
      }
  });

  function findSourceByState(state) {
      return results.filter(data => data.location === state);
  }

  function findSourceByZipcode(zip) {
      return results.filter(data => [data.zipcodes].includes(zip));
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

  setTimeout(() => {
      let table = document.getElementById("source-list");
      let data = Object.keys(results[0]);
      generateTableHead(table, data);
      generateTable(table, results);
  }, 2000);
})();
