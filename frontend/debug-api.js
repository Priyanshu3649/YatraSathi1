// Create a script to debug the API response
console.log('Debug script loaded');

// Override fetch to log responses from /tickets/my
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  if (typeof url === 'string' && url.includes('/tickets/my')) {
    console.log('Intercepted fetch to /tickets/my');
    return originalFetch.apply(this, args)
      .then(response => {
        // Clone the response to read it twice
        const clone = response.clone();
        clone.json().then(data => {
          console.log('Response from /tickets/my:', data);
          console.log('Response type:', typeof data);
          console.log('Is array?', Array.isArray(data));
        });
        return response;
      });
  }
  return originalFetch.apply(this, args);
};

// Also intercept axios requests
if (window.axios) {
  const originalGet = window.axios.get;
  window.axios.get = function(url, config) {
    if (url.includes('/tickets/my')) {
      console.log('Intercepted axios.get to /tickets/my');
      return originalGet.call(this, url, config)
        .then(response => {
          console.log('Axios response from /tickets/my:', response.data);
          console.log('Response type:', typeof response.data);
          console.log('Is array?', Array.isArray(response.data));
          return response;
        });
    }
    return originalGet.call(this, url, config);
  };
}

console.log('Debug script setup complete');