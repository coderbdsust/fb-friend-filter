# fb-friend-filter

Run following in the reps to ignore `credential.json` local changes:

```
git update-index --skip-worktree credential.json
```

Ref: https://stackoverflow.com/questions/1753070/how-do-i-configure-git-to-ignore-some-files-locally

___

To list files ignored with `skip-worktree`:

```
git ls-files -v . | grep ^S
```

Ref: https://stackoverflow.com/questions/42363881/how-to-list-files-ignored-with-skip-worktree
