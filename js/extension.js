chrome.storage.sync.get({ keywords: [] }, res => {
  cleanupFeed(res.keywords);
});

function cleanupFeed(keywords) {
  console.log('Activated Cleanup Feed Remover with keywords:', keywords);

  function feedremove() {
    const selector = '#contentArea div[role="article"]:not(.nonfeed)';
    /** @type {NodeListOf<HTMLDivElement>} */
    const elems = document.querySelectorAll(selector);
    elems.forEach(article => {
      article.classList.add('nonfeed');
      const str = article.innerText.toLowerCase();
      if (keywords.some(keyword => str.includes(keyword))) {
        article.remove();
        console.count('[Cleanup Feed Remover] Posts Hidden');
        if(typeof chrome.app.isInstalled!=='undefined'){
        chrome.storage.local.get({ count: 0 }, res => {
          chrome.storage.local.set({ count: res.count + 1 });
        });
       }
      }
    });
  }

  function isArticleAdded(mutation) {
    // TODO: this filter can be improved a lot
    return mutation.addedNodes.length;
  }

  const observer = new MutationObserver(mutations => {
    if (mutations.some(isArticleAdded)) feedremove();
  });

  const timer = setInterval(() => {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    clearInterval(timer);
    observer.observe(contentArea, { childList: true, subtree: true });
    feedremove();
  }, 200);
}
