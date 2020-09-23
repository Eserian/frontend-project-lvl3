export default (data) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/xml');

  const channelTitleElement = document.querySelector('channel > title');
  const channelTitle = channelTitleElement.textContent;

  const itemsElements = document.querySelectorAll('item');
  const items = [...itemsElements].map((item) => {
    const itemTitleElement = item.querySelector('title');
    const itemLinkElement = item.querySelector('link');
    const title = itemTitleElement.textContent;
    const link = itemLinkElement.textContent;

    return { title, link };
  });

  return { title: channelTitle, items };
};
