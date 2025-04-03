const pathMap = {
    '/source/shuffle.html': document.getElementById('shuffle'),
    '/source/media.html': document.getElementById('media'),
    '/source/about.html': document.getElementById('about'),
    '/source/aotw.html': document.getElementById('aotw'),
  };
  
  const path = location.pathname;
  
  if (pathMap[path]) {
    pathMap[path].classList.add('active');
  }
