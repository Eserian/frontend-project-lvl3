/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import i18next from 'i18next';
import watch from './view';
import parseRss from './rssParser';
import resources from './locales';

const validate = (url, urlList) => {
  const schema = yup
    .string()
    .url()
    .notOneOf(urlList, i18next.t('wasAddedError'));

  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const addProxy = (url) => {
  const PROXY_URL = 'https://cors-anywhere.herokuapp.com';
  return `${PROXY_URL}/${url}`;
};

const getNewPosts = (url, watchedState) => {
  const urlWithProxy = addProxy(url);

  axios.get(urlWithProxy)
    .then((response) => {
      const rss = response.data;
      const parsed = parseRss(rss);
      const [feed] = watchedState.feeds.filter((f) => f.url === url);
      const newPosts = parsed.items.map((item) => ({ ...item, feedId: feed.id }));
      const oldPosts = watchedState.posts.filter((p) => p.feedId === feed.id);
      const diff = _.differenceWith(newPosts, oldPosts, _.isEqual);

      if (diff) {
        watchedState.posts = [...diff, ...watchedState.posts];
      }

      setTimeout(() => getNewPosts(url, watchedState), 5000);
    });
};

const loadRssFeed = (url, watchedState) => {
  const urlWithProxy = addProxy(url);

  axios.get(urlWithProxy)
    .then((response) => {
      const rss = response.data;
      const parsed = parseRss(rss);
      const newFeed = { url, title: parsed.title, id: _.uniqueId() };
      const posts = parsed.items.map((item) => ({ ...item, feedId: newFeed.id }));

      watchedState.posts = [...posts, ...watchedState.posts];
      watchedState.feeds = [newFeed, ...watchedState.feeds];
      watchedState.form.valid = true;
      watchedState.form.error = null;
      watchedState.processState = 'filling';

      setTimeout(() => getNewPosts(url, watchedState), 5000);
    })
    .catch(() => {
      watchedState.processError = i18next.t('networkError');
      watchedState.processState = 'failed';
    });
};

export default () => {
  const state = {
    form: {
      valid: true,
      error: null,
    },
    processState: 'filling',
    processError: null,
    feeds: [],
    posts: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.form-control'),
    submit: document.querySelector('.btn'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
  };

  const watchedState = watch(state, elements);

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const urlList = watchedState.feeds.map((f) => f.url);
      const error = validate(url, urlList);

      if (!error) {
        watchedState.form.valid = true;
        watchedState.form.error = null;
        watchedState.processState = 'loading';
        loadRssFeed(url, watchedState);
      } else {
        watchedState.form.error = error;
        watchedState.form.valid = false;
      }
    }),
  );
};
