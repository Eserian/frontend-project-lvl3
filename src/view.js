import onChange from 'on-change';

const postRender = ({ title, link }) => {
  const divEl = document.createElement('div');
  const aEl = document.createElement('a');
  aEl.href = link;
  aEl.textContent = title;
  divEl.append(aEl);
  return divEl;
};

export default (state, elements) => {
  const validHandle = () => {
    const { input } = elements;
    const { form: { valid } } = state;
    if (!valid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const errorHandle = () => {
    const { feedback } = elements;
    const { form: { error } } = state;
    feedback.textContent = error;
    feedback.classList.add('text-danger');
  };

  const processStateHandle = () => {
    const { input, submit, feedback } = elements;
    const { form: { processState } } = state;
    switch (processState) {
      case 'filling':
        submit.disabled = false;
        input.disabled = false;
        input.value = '';
        feedback.textContent = 'Rss has been loaded';
        feedback.classList.add('text-success');
        break;
      case 'loading':
        submit.disabled = true;
        input.disabled = true;
        feedback.textContent = 'Loading...';
        feedback.classList.add('text-success');
        break;
      default:
        break;
    }
  };

  const feedsHandle = () => {
    const { feedsContainer } = elements;
    const { feeds, posts } = state;
    feedsContainer.innerHTML = '';

    feeds.forEach(({ title, id }) => {
      const feedPosts = posts
        .filter((p) => p.feedId === id)
        .map(postRender);

      const hEl = document.createElement('h2');
      hEl.textContent = title;
      feedsContainer.append(hEl, ...feedPosts);
    });
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.valid':
        validHandle();
        break;
      case 'form.error':
        errorHandle();
        break;
      case 'form.processState':
        processStateHandle();
        break;
      case 'feeds':
        feedsHandle();
        break;
      default:
        break;
    }
  });

  return watchedState;
};
