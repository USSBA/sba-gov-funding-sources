function renderExtraFields(event) {
  const mobileResolution = window.matchMedia("(max-width: 768px)");

  if (mobileResolution.matches) {
    renderModal(event);
  } else {
    ToggleExtraFields(event);
  }
};

// Helper function
var getSiblings = function(elem) {
    return Array.prototype.filter.call(elem.parentNode.children, function(sibling) {
        return sibling !== elem;
    });
};

function ToggleExtraFields(event) {
  // Change display of arrow clicked
  const programNameArrow = event.target.parentNode.children[0];
  programNameArrow.classList.toggle('right')
  programNameArrow.classList.toggle('down')

  // Create array of all columns in row containing arrow that was clicked
  const columnsInRowClicked = getSiblings(event.target.closest('td'))

  // Iterate through columns and expand the basic ones and uncollapse (display) the extras
  columnsInRowClicked.forEach(
      function(element) {
          if (element.classList.contains('basic')) {
            element.classList.toggle('unexpanded');
          }
      }
  )

  const nextParentSiblingElement = event.target.parentNode.parentNode.nextElementSibling;

  if (nextParentSiblingElement.classList.contains('collapse-extra-row')) {
    nextParentSiblingElement.classList.add('expand-extra-row');
  } else {
    nextParentSiblingElement.classList.remove('expand-extra-row');
  }

  nextParentSiblingElement.classList.toggle('collapse-extra-row');
}

function renderModal(event) {
  const modalCloseTrigger = document.querySelector('.popup-modal__close');
  const bodyBlackout = document.querySelector('.blackout-body');

  const { modalTrigger } = event.target.parentElement.dataset;
  const popupModal = document.querySelector(`[data-modal="${modalTrigger}"]`);

  popupModal.classList.add('is--visible');
  bodyBlackout.classList.add('is-blacked-out');

  popupModal.querySelector('.popup-modal__close').addEventListener('click', () => {
    popupModal.classList.remove('is--visible');
    bodyBlackout.classList.remove('is-blacked-out');
  })

  bodyBlackout.addEventListener('click', () => {
    // TODO: Turn into a function to close modal
    popupModal.classList.remove('is--visible');
    bodyBlackout.classList.remove('is-blacked-out');
  })
}
