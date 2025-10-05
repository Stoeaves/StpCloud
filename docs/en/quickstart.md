## Preparation

- A Github Account
- A Cloudflare Account
- Github Personal access tokens (classic), If you have already logged in, you can click [there](https://github.com/settings/tokens) to create
- Fork [this repository](https://github.com/Stoeaves/StpCloud)

## Deployment
### Github
- Fork [this repository](https://github.com/Stoeaves/StpCloud)
- Modify **`__API_URL__`** in **`vite.config.ts`** on line 26 into the URL of your Cloudflare Worker
- Create a `storage repository` (it can be private)
> We strongly recommend creating a private repository to protect your privacy

### Cloudflare
- Create a worker (**Data Processing Worker**)
- Copy the code in the [_worker.js](https://github.com/Stoeaves/StpCloud/blob/main/_worker.js) file to the Worker
- Click the "Deploy" button
- Create a worker again (**Interactive Page Worker**)
- Select **`Import a repository`** and select the forked repository
- Wait for the deployment to complete

## Bind KV
- Create a KV.
- Bind the creation of KV to the `Data Processing Worker`, with the variable name `KV`
> Pay attention to the capitalization of variable names!

## Bind Environment Variables
- Add environment variables to the `Data Processing Worker`
| Name       | Required | Instructions                         |
| :----------- | :------- | :--------------------------- |
| ADMIN_PASS   | Yes       | Administrator password                   |
| GITHUB_TOKEN | Yes       | Github personal access token |
| REPO_OWNER   | Yes       | Github account name                |
| REPO_NAME    | Yes       | the name of `Storage Repository`                       |
| REPO_BRANCH  | Yes       | the branch of `Storage Repository`                     |
> Pay attention to the capitalization of variable names!

###### At this point, your deployment is complete and you can use this service by accessing your Worker URL

## Warning
### The permission of **Github Token**
> Since the `Data Processing Worker` will operate your repository through the Github API, you need to give Github Token sufficient permissions
- ~~If you trust us, you can check all permissions~~ _Of course, I know you wouldn't do that_
- `repo` All permissions