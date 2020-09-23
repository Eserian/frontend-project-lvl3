/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watch from './view';
import rssParse from './rssParser';

const getSchema = (urlList) => yup.string().url().notOneOf(urlList);

const addProxy = (url) => {
  const PROXY_URL = 'https://cors-anywhere.herokuapp.com';
  return `${PROXY_URL}/${url}`;
};

const loadRss = (url, watchedState) => {
  const urlWithProxy = addProxy(url);
  axios.get(urlWithProxy)
    .then((response) => {
      const parsed = rssParse(response.data);
      const newFeed = { url, title: parsed.title, id: _.uniqueId() };
      const posts = parsed.items.map((item) => ({ ...item, feedId: newFeed.id }));
      watchedState.posts = [...posts, ...watchedState.posts];
      watchedState.feeds = [newFeed, ...watchedState.feeds];

      watchedState.form.processState = 'filling';
      watchedState.form.valid = true;
      watchedState.form.error = null;
    });
};

const validate = (url, urlList) => {
  const schema = getSchema(urlList);

  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      valid: true,
      error: null,
    },
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

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const urlList = watchedState.feeds.map((f) => f.url);
    const error = validate(url, urlList);
    if (!error) {
      watchedState.form.processState = 'loading';
      loadRss(url, watchedState);
    } else {
      watchedState.form.processState = 'error';
      watchedState.form.valid = false;
      watchedState.form.error = error;
    }
  });
};
