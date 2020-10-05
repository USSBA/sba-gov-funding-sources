(()=>{
  const dataList = document.getElementById('json-datalist');
  const input2 = document.getElementById('zip2');

  const input = document.getElementById('zip')
  input.addEventListener('input', updateValue)

  function updateValue(event) {
    console.log(event.target.value);
    // Make sure there's a valid zipcode (5 digits)
    if (event.target.value.length == 5) {
      console.log(findSourceByZipcode(event.target.value))
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
