<div align="center">

<h1 align="center">StpCloud</h1>

[English](README_EN.md) / 简体中文

[演示站点](https://file.seave.top) / [使用教程](https://seave.top/posts/stpcloud/)

一个基于 Cloudflare Worker、Github API，为个人打造的云盘服务

<p>
<a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/github/license/Stoeaves/StpCloud" alt="License: GPL-3.0"></a>
<a href="https://github.com/Stoeaves/StpCloud/stargazers"><img src="https://img.shields.io/github/stars/Stoeaves/StpCloud" alt="GitHub stars"></a>
<a href="https://github.com/Stoeaves/StpCloud/forks"><img src="https://img.shields.io/github/forks/Stoeaves/StpCloud" alt="GitHub forks"></a>
<a href="https://github.com/Stoeaves/StpCloud/releases"><img src="https://img.shields.io/github/v/release/Stoeaves/StpCloud" alt="GitHub release"></a>
</p>

</div>

## ✅ 已实现功能

- 基础文件上传、下载
- 支持私密文件夹
- 自定义文件分享外链

## 使用教程

#### 1.准备工作：

- 一个 Github 账户
- 一个 Cloudflare 账户
- Github Personal access tokens (classic) **如果你已登录，请[点击这里前往生成](https://github.com/settings/tokens)**
- Fork 此仓库

#### 2.部署

- **Cloudflare Worker:**
- 前往[Cloudflare](https://dash.cloudflare.com)
- 创建一个 Worker
- 复制[_worker.js](https://github.com/Stoeaves/StpCloud/blob/main/_worker.js)的内容
- 粘贴至创建的 Worker 当中并部署
- **Github:**
- Fork 此仓库
- 在你 Fork 的仓库里修改 **`vite.config.ts`** 中第 26 行的 **`__API_URL__`** 的链接改成你的 Worker 地址（可以自定义）
- 再次返回 Cloudflare Worker 当中创建一个 Worker
- 选择 **`导入储存库`** 并选择你 Fork 的仓库
- 无需任何操作直接点击部署等待成功即可

#### 3.使用

- 点击[这里](https://seave.top/posts/stpcloud/)查看使用教程

## Q&A

- **为什么没有删除文件功能？**
  - 由于我们采用分片上传形式，目前Github API并不支持删除文件夹功能，会导致删除文件特别缓慢，故暂不提供删除文件功能
- **我该如何删除文件？**
  - 在Github仓库中，找到对应文件哈希值的文件夹，删除即可（效率非常高）

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Stoeaves/StpCloud&type=Date)](https://www.star-history.com/#Stoeaves/StpCloud&Date)

## 开源协议

[GPL-3.0](LICENSE)
