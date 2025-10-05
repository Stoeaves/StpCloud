## 准备工作

- 一个 Github 账户
- 一个 Cloudflare 账户
- Github Personal access tokens (classic) **如果你已登录，请[点击这里前往生成](https://github.com/settings/tokens)**
- Fork [此仓库](https://github.com/Stoeaves/StpCloud)

## 开始部署
### Github
- Fork [此仓库](https://github.com/Stoeaves/StpCloud)
- 在你 Fork 的仓库里修改 **`vite.config.ts`** 中第 26 行的 **`__API_URL__`** 的链接改成你的 Worker 地址（可以自定义）
- 创建一个`储存仓库`（可私密）
> 我们强烈建议创建一个私密仓库以保护您的隐私

### Cloudflare
- 创建一个 Worker（**数据处理Worker**）
- 复制[_worker.js](https://github.com/Stoeaves/StpCloud/blob/main/_worker.js)的内容
- 粘贴至创建的 Worker 当中并部署
- 再次创建一个Worker（**交互页面Worker**）
- 选择 **`导入储存库`** 并选择你 Fork 的仓库
- 无需任何操作直接点击部署等待成功即可

## 绑定KV
- 创建一个KV
- 将创建kv绑定至`数据处理Worker`中，变量名为`KV`
> 注意变量名大小写

## 配置环境变量
- 向`数据处理Worker`添加环境变量
| 变量名       | 是否必须 | 说明                         |
| :----------- | :------- | :--------------------------- |
| ADMIN_PASS   | 是       | 管理员密码                   |
| GITHUB_TOKEN | 是       | Github Personal access token |
| REPO_OWNER   | 是       | Github 账户名                |
| REPO_NAME    | 是       | 储存仓库名                       |
| REPO_BRANCH  | 是       | 储存仓库分支                     |
> 注意变量名大小写

###### 至此，你的部署已经完成，你可以通过访问你的Worker地址来使用此服务

## 注意事项
### Github Token权限
> 由于`数据处理Worker`会通过Github API来操作你的储存库，所以你需要给予Github Token足够的权限
- ~~如果你相信我们你可以勾选所有权限~~ _当然我知道你不会这样做_
- `repo` 所有权限