import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: true,
  trickleSpeed: 200,
  minimum: 0.08,
  parent: 'body',
});

export const startProgress = () => {
  NProgress.start();
};

export const closeProgress = () => {
  NProgress.done();
};
