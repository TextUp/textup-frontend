import $ from 'jquery';

export function isOrContainsElement(el, elToFind) {
  return !el || !elToFind ? false : el === elToFind || $.contains(el, elToFind);
}

export function buildElement(tagName, ...classNames) {
  const el = document.createElement(tagName || 'div');
  el.className = classNames.join(' ');
  return el;
}

export function wrapElement(newContainer, childEl) {
  if (!newContainer || !childEl) {
    return;
  }
  // perform this two-step process instead of directly calling wrap because
  // wrap may clone the container, so we lose the reference to it.
  const $child = $(childEl);
  // insert or move container to next to child
  $child.before(newContainer);
  // move child inside of container
  $child.appendTo(newContainer);
}

export function unwrapElement(childEl) {
  if (!childEl) {
    return;
  }
  $(childEl).unwrap();
}

export function insertElementsWithin(containerEl, ...elementsToAppend) {
  if (!containerEl) {
    return;
  }
  $(containerEl).append(elementsToAppend);
}

export function removeElement(elToRemove) {
  if (!elToRemove) {
    return;
  }
  $(elToRemove).remove();
}
