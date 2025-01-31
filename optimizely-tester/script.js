document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('optimizelyForm');
  const results = document.getElementById('results');
  const status = document.getElementById('status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const sdkKey = document.getElementById('sdkKey').value;
    const flagName = document.getElementById('flagName').value;
    const userId = document.getElementById('userId').value;
    const attributesInput = document.getElementById('attributes').value;
    const eventName = document.getElementById('eventName').value;

    if (!sdkKey || !flagName || !userId) {
      status.textContent = "Please fill out SDK Key, Flag Name, and User ID.";
      return;
    }

    const attributes = {};
    if (attributesInput) {
      attributesInput.split(',').forEach((pair) => {
        const [key, value] = pair.split(':').map((item) => item.trim());
        if (key && value) {
          attributes[key] = value;
        }
      });
    }

    status.textContent = "Initializing Optimizely...";

    const optimizelyClient = window.optimizelySdk.createInstance({ sdkKey });

    optimizelyClient.onReady().then(function (result) {
      if (result.success) {
        const user = optimizelyClient.createUserContext(userId, attributes);
        const decision = user.decide(flagName);
        console.log(decision)

        // Display User Context and Flag Decision in Results Container
        results.innerHTML = `
          <div>
            <p><strong>User Context:</strong></p>
            <pre>${JSON.stringify(attributes, null, 2)}</pre>
          </div>
          <div>
          <p>Flag Name: ${flagName}</p>
            <p><strong>Flag Variation:</strong> ${decision.variationKey}</p>
          </div>
        `;

        // Track event if provided
        if (eventName) {
          try {
            user.trackEvent(eventName);
            results.innerHTML += `<p><strong>Event Tracked:</strong> ${eventName}</p>`;
          } catch (error) {
            results.innerHTML += `<p><strong style="color: red;">Error:</strong> Failed to track event "${eventName}". ${error.message}</p>`;
          }
        }
      } else {
        status.textContent = "Error initializing Optimizely: " + result.reason;
      }
    }).catch(function (error) {
      status.textContent = "Error initializing Optimizely: " + error.message;
    });
  });
});
