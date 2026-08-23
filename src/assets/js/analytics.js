(() => {
  const measurementId = 'G-GHPFLMRQ3T';
  let hasLoaded = false;

  const loadAnalytics = () => {
    if (hasLoaded) return;
    hasLoaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  };

  const scheduleAnalytics = () => {
    window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadAnalytics, { timeout: 4000 });
        return;
      }

      loadAnalytics();
    }, 3000);
  };

  if (document.readyState === 'complete') {
    scheduleAnalytics();
  } else {
    window.addEventListener('load', scheduleAnalytics, { once: true });
  }
})();
