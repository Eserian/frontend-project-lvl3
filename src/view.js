import onChange from 'on-change';
import i18next from 'i18next';

const postRender = ({ title, link }) => {
  const divEl = document.createElement('div');
  const aEl = document.createElement('a');
  aEl.href = link;
  aEl.textContent = title;
  divEl.append(aEl);
  return divEl;
};

export default (state, elements) => {
  const handleFormValid = () => {
    const { input } = elements;
    const { form: { valid } } = state;
    if (!valid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }
  };

  const handleFormError = () => {
    const { feedback } = elements;
    const { form: { error } } = state;
    if (error) {
      feedback.textContent = error;
      feedback.classList.add('text-danger');
    } else {
      feedback.textContent = '';
      feedback.classList.remove('text-danger');
    }
  };

  const handleLoadProcessStatus = () => {
    const { input, submit, feedback } = elements;
    const { loadProcess: { status, error } } = state;
    switch (status) {
      case 'waiting':
        submit.disabled = false;
        input.disabled = false;
        input.value = '';
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        feedback.textContent = i18next.t('loadSuccess');
        break;
      case 'loading':
        submit.disabled = true;
        input.disabled = true;
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        feedback.textContent = i18next.t('loading');
        break;
      case 'failed':
        submit.disabled = false;
        input.disabled = false;
        feedback.textContent = error;
        feedback.classList.add('text-danger');
        break;
      default:
        throw new Error('Unexpected state');
    }
  };

  const handleFeeds = () => {
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

  const mapping = {
    'form.valid': handleFormValid,
    'form.error': handleFormError,
    'loadProcess.status': handleLoadProcessStatus,
    feeds: handleFeeds,
    posts: handleFeeds,
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};
