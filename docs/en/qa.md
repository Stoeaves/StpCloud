### Why is there no file deletion function?
- Due to our use of sharded upload, the Github API currently does not support the deletion of folders, which can result in slow file deletion. Therefore, we do not currently provide the function of deleting files.

### How should I delete files?
- In the Github repository, find the folder with the corresponding file hash value name and delete it (very efficient)

### Why does it keep loading and opening the console after deployment and get an error (status code 500)?
- You need to create a README.md in the storage repository with arbitrary content. As for why this is the case, we don't know

### Post Issues
- If you have any questions or suggestions, please submit an issue to the [Issues](https://github.com/Stoeaves/StpCloud/issues) page