<div align="center">

<h1 align="center">StpCloud</h1>

English / [简体中文](README_EN.md)

A Cloud Storage Service Tailored for Individuals

<p>
<a href="https://www.gnu.org/licenses/gpl-3.0.html"><img src="https://img.shields.io/github/license/Stoeaves/StpCloud" alt="License: GPL-3.0"></a>
<a href="https://github.com/Stoeaves/StpCloud/stargazers"><img src="https://img.shields.io/github/stars/Stoeaves/StpCloud" alt="GitHub stars"></a>
<a href="https://github.com/Stoeaves/StpCloud/forks"><img src="https://img.shields.io/github/forks/Stoeaves/StpCloud" alt="GitHub forks"></a>
<a href="https://github.com/Stoeaves/StpCloud/releases"><img src="https://img.shields.io/github/v/release/Stoeaves/StpCloud" alt="GitHub release"></a>
</p>


</div>

## ✅ Features
- Basic file upload and download
- Support private folders
- Customize file sharing external links

## Usage

#### 1. Preparation 

- A Github Account
- A Cloudflare Account
- Github Personal Access Tokens (Classic) **If you have logged in Github, please click [there to generate your token](https://github.com/settings/tokens)**
- Fork this repository

#### 2. Deployment

- **Cloudflare Worker:**
- Go to [Cloudflare](https://dash.cloudflare.com)
- Create a new Worker
- Copy the code in the [_worker.js](https://github.com/Stoeaves/StpCloud/blob/main/_worker.js) file to the Worker
- Click the "Save & Deploy" button
- **Github:**
- Fork this repository
- Modify **`__API_URL__`** in **`vite.config.ts`** on line 26 into the URL of your Cloudflare Worker
- Return to Cloudflare Worker, and create a new worker again
- Select **`Import a repository`** and select the forked repository
- Click the "Save & Deploy" button

#### 3. Usage
- Click [here](https://seave.top/posts/stpcloud/) to view the usage tutorial

## Q&A

- **Why is there no file deletion function?**
   - Due to our use of sharded upload, the Github API currently does not support the deletion of folders, which can result in slow file deletion. Therefore, we do not currently provide the function of deleting files.
- **How should I delete files?**
   - In the Github repository, find the folder with the corresponding file hash value name and delete it (very efficient)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Stoeaves/StpCloud&type=Date)](https://www.star-history.com/#Stoeaves/StpCloud&Date)

## License

[GPL-3.0](LICENSE)
