// General utility functions
export function delay(ms) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, ms);
  });
}

export function showMessage(elementId, duration = 3000) {
  const message = document.getElementById(elementId);
  if (message) {
    message.style.display = 'block';
    if (duration > 0) {
      delay(duration).then(() => {
        message.style.display = 'none';
      });
    }
  }
}

export function hideMessage(elementId) {
  const message = document.getElementById(elementId);
  if (message) {
    message.style.display = 'none';
  }
}

export function getElementById(id) {
  return document.getElementById(id);
}

export function querySelectorAll(selector) {
  return document.querySelectorAll(selector);
}
