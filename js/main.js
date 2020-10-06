(()=>{
  const dataList = document.getElementById('json-datalist');
  const input2 = document.getElementById('zip2');

  const input = document.getElementById('zip')
  input.addEventListener('input', updateValue)

  async function updateValue(event) {
    // Make sure there's a valid zipcode (5 digits)
    if (event.target.value.length === 5) {
      const fundingData = await fetchFundingData();
      findSourceByZipcode(event.target.value, fundingData)
    }
  }
})();

function ToggleExtraFields(event) {
  event.target.classList.toggle("right")
  event.target.classList.toggle("down")
  Array.from(document.getElementsByClassName("extra")).forEach(
    function(element, index, array) {
      element.classList.toggle("collapsed")
    }
  )
}
