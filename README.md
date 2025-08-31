<div align="center">

<h1 align="center">StpCloud</h1>

[English](README_EN.md) / 简体中文

一个基于Cloudflare Worker、Github API，为个人打造的云盘服务

<p>
<a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/github/license/Stoeaves/StpCloud" alt="License: GPL-3.0"></a>
<a href="https://github.com/Stoeaves/StpCloud/stargazers"><img src="https://img.shields.io/github/stars/Stoeaves/StpCloud" alt="GitHub stars"></a>
<a href="https://github.com/Stoeaves/StpCloud/forks"><img src="https://img.shields.io/github/forks/Stoeaves/StpCloud" alt="GitHub forks"></a>
<a href="https://github.com/Stoeaves/StpCloud/releases"><img src="https://img.shields.io/github/v/release/Stoeaves/StpCloud" alt="GitHub release"></a>
</p>


</div>

## ✅已实现功能
- 基础文件上传、删除、下载
- 支持私密文件夹
- 自定义文件分享外链

## 使用教程
#### 1.准备材料：
- 一个Github账户
- 一个Cloudflare账户
- Github Personal access tokens (classic) __如果你已登录，请[点击这里前往生成](https://github.com/settings/tokens)__

#### 2.下载文件
- **_worker.js** Worker文件
- **page.zip** 网页压缩包

#### 3.部署
- **Cloudflare操作：**
- 1.创建Worker，将下载的 **_worker.js** 文件内容复制到新建Worker中
- 2.创建KV，在Worker中绑定KV，变量名为：**KV**
- 3.创建Pages，将下载的**page.zip**上传至Pages并部署
> 需要将**page.zip**中assets文件夹中的**constant.js**中的apiUrl修改为你的worker地址！
- **Github操作：**
- 1.创建一个仓库
- 2.在Settings -> Developer Settings -> Personal access tokens -> Tokens (classic)中创建一个Token

### Cloudflare Worker环境变量
| 变量名 | 是否必须 | 说明 |
| :--- | :--- | :--- |
| ADMIN_PASS | 是 | 管理员密码 |
| GITHUB_TOKEN | 是 | Github Personal access token |
| REPO_OWNER | 是 | Github账户名 |
| REPO_NAME | 是 | 仓库名 |
| REPO_BRANCH | 是 | 仓库分支 |
### Github Token说明：
- **需要的权限** ~~如果你相信我们你可以勾选所有权限~~ _当然我知道你不会这样做_
- 1._repo_ 所有权限
- 2._project_ 所有权限
- 3._codespace_ 所有权限
## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Stoeaves/StpCloud&type=Date)](https://www.star-history.com/#Stoeaves/StpCloud&Date)

## 开源协议

[GPL-3.0](LICENSE)
