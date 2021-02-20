# COVID-19 Funding Sources
Single page to display COVID-19 funding sources on SBA.gov.  The agency compiled a spreadsheet of alternative funding sources that are available to small business owners seeking relief during the COVID-19 pandemic.  This single page tool was designed and developed to help business owners find options in their local zipcode.  This was also a technology experiment that challenges the idea you need a modern JavaScript framework (e.g. React) to be productive. It was originally conceived of after a fully staffed development team (8 members) estimated it would take 4-6 weeks (2-3 sprints) to complete the project, using an established stack using React/Redux.  

The result is that a team of 2 developers was able to create a working prototype in 4 hours and a fully functional tool in 1 week (the additional time was spent on CSS customization), using a completely Vanilla JavaScript approach.  It took incremental work over another 1 week to get the page styled to an Minimum Viable Project (MVP) level in the eyes of the designer.  In short, a much smaller team using simpler technology (that's also easier to maintain) was actually somewhere between 50-75% faster in this given case.

You can see the [final result here](https://www.sba.gov/covid-19-funding-sources/index.html).

## Philosophy
Use the smallest, easiest to maintain technology that you possibly can, and then run it with zero upkeep, because what you build must last forever(tm).

### Frontend 
Bootstrap with modern HTML and CSS template: [HTML5 Boilerplate](https://html5boilerplate.com/).  

Use only Vanilla JavaScript, meaning native DOM APIs and functions.  Avoid at all costs:
* A framework
* A build tool/step
* Any dependencies

The entire page only requires 301 lines total of Vanilla JavaScript to do everything we need.

### Backend 
After evaluating the data, we realized that in terms of size it fell into this odd gray area.  It's too small to justify being stored in a database, and also, it has no need for atomicity (it gets 1 synchronous weekly update, but otherwise it's always just read only).  However, it's also too big (15MB in CSV format) to responsibly send to mobile users, even if streaming the data.  Finally, we also did not want to have to maintain an API using any type of compute resource (Lambda, Fargate, EC2), because these things must be patched, their runtimes updated, and their dependencies upgraded.  We are fully embracing the zero maintenance requirement.

Since the page was going to offer zipcode as the primary search/filter method, we suddenly realized we had access to a unique key.

### Using S3 for an API-as-a-File-System
A unique key meant we could organize the CSV file (which is human digestible) into 1 JSON file per zip code, so that when a user comes and search '76132' we could simply fetch the JSON for that zipcode: 76132.json and hydrate the page data.  This is advantageous in two different ways:
1. The size of actual data we send the client at any given time is tiny (50-100kb), so very performant
2. Now we can host our entire "API" on S3, meaning no compute resource necessary

We chose Python to write a script that massages the raw CSV file and generates 1 json file per zipcode, taking 51 lines of total code:

```python
# Traverse all of the zipcodes
for z in zipcodes:
    # Create a new list to store programs found in a given zipcode
    programsByZipcode = []
    # Traverse all of the programs
    for program in programs:
        # Check to see if the zipcode appears in the program's eligible zipcodes list
        if program["zipcode"].find(z) != -1:
            # If it does, create a deep copy of the object (so we can safely delete a key)
            copiedProgram = copy.deepcopy(program)
            # Delete the zipcode key, because as it turns out, it accounts for a lot of the weight
            del copiedProgram["zipcode"]
            # Add the trimmed up program data to the new list
            programsByZipcode.append(copiedProgram)

    # At the end of checking every program for a certain zipcode, if we found viable programs, save them as a <zipcode>.json file
    if(len(programsByZipcode) > 0):
        zipcodeJSON = z + '.json'
        with open(zipcodeJSON, "w") as jsonfile:
            json.dump(programsByZipcode, jsonfile)
        print(str(len(programsByZipcode)) + " programs found in the " + z + " zipcode output to " + zipcodeJSON)
```
You can see the whole program as it runs locally in [group-data-by-zipcode.py](https://github.com/USSBA/sba-gov-funding-sources/blob/master/data/localfs-group-data-by-zipcode.py).

We used vanilla JavaScript to fetch from S3+CloudFront:

```javascript
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
    console.warn(data.json());
    return data.json();
  })
}
```
You can see all of the critical business logic in the [main.js](https://github.com/USSBA/sba-gov-funding-sources/blob/master/js/main.js) file.

## Contributing
We welcome contributions. Please read [CONTRIBUTING](CONTRIBUTING.md) for how to contribute.

We strive for a welcoming and inclusive environment for the sba-gov-funding-sources project.
Please follow this guidelines in all interactions:
1. Be Respectful: use welcoming and inclusive language.
2. Assume best intentions: seek to understand other's opinions.
## License
sba-gov-funding-sources is licensed under the MIT License.
A copy of that license is distributed with this software.

## Maintainers
Created in 1953, the U.S. Small Business Administration (SBA) continues to help small business owners and entrepreneurs pursue the American dream. The SBA is the only cabinet-level federal agency fully dedicated to small business and provides counseling, capital, and contracting expertise as the nation’s only go-to resource and voice for small businesses.

By making source code available for sharing and re-use across Federal agencies, we can avoid duplicative custom software purchases and promote innovation and collaboration across Federal agencies. By opening more of our code to the brightest minds inside and outside of government, we can enable them to work together to ensure that the code is reliable and effective in furthering our national objectives. And we can do all of this while remaining consistent with the Federal Government’s long-standing policy of technology neutrality, through which we seek to ensure that Federal investments in IT are merit-based, improve the performance of our government, and create value for the American people.

## Security Policy 
Please do not submit an issue on GitHub for a security vulnerability. 
Please contact the development team [{{ HQVulnerabilityManagement@sba.gov }}](mailto:{{ HQVulnerabilityManagement@sba.gov }}).

Be sure to include all the pertinent information.