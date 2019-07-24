const getIdFromUrl = () => {
  const url = window.location.pathname.split('/');
  if(! url[url.indexOf("test") + 1]) {
    return;
  }

  return url[url.indexOf("test") + 1]
}

export default getIdFromUrl;