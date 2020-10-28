// Helper function
var getSiblings = function(elem) {
    return Array.prototype.filter.call(elem.parentNode.children, function(sibling) {
        return sibling !== elem;
    });
};

function ToggleExtraFields(event) {
    // Change display of arrow clicked
    event.target.classList.toggle('right')
    event.target.classList.toggle('down')

    // Create array of all columns in row containing arrow that was clicked
    const columnsInRowClicked = getSiblings(event.target.closest('td'))

    // Iterate through columns and expand the basic ones and uncollapse (display) the extras
    columnsInRowClicked.forEach(
        function(element) {
            if (element.classList.contains('basic')) {
                element.classList.toggle('unexpanded')
            }

            if (element.classList.contains('extra')) {
                element.classList.toggle('collapsed')
            }
        }
    )
}