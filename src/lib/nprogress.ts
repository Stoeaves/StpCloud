import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // 引入默认样式

// 全局进度条的配置
NProgress.configure({
  easing: 'ease', // 动画缓动函数，例如 'ease'、'linear'
  speed: 500, // 进度条递增动画的毫秒速度
  showSpinner: true, // 是否显示右侧的螺旋加载图标，默认为 true
  trickleSpeed: 200, // 自动递增间隔的毫秒数
  minimum: 0.08, // 初始化时的最小百分比，0.08 是默认值
  parent: 'body', // 指定进度条的父容器，通常是 'body'
});

// 导出 start 和 done 方法供其他模块使用
export const startProgress = () => {
  NProgress.start();
};

export const closeProgress = () => {
  NProgress.done();
};
