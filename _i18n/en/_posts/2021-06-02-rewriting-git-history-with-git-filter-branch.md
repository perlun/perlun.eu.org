---
layout: post
title:  "Rewriting git history with git filter-branch and git rebase -i"
categories:
- programming
- git
---
Sometimes, you find yourself in a situation where you need to do rather drastic changes to a `git` repository, like when you actually want to remove one or more files _including their full history_ from the repository. This is where `git filter-branch` can come in handy. In this blog post, we take a closer look at how it can help us with this task.

First, a word of warning:

> **Warning**: `git filter-branch` is a destructive `git` operation. When used unwisely, you can easily cause permanent damage to your repository, including removing files that you didn't intend to remove. Please inspect the results of the operation carefully. **Do not** force-push the result to your main repository without having one or more proper backups of the full repository, including the `.git` directory.

Now, let's move on to the more interesting parts.

### My use case: making  a previously private `git` repository into a public project

Here's what I had to begin with: a private project with some [Ansible](https://github.com/ansible/ansible) roles and associated playbooks. I wanted to make this public, to share it with the community. But, here's the catch: my project also contained my private _inventory_ including both things like `host_vars` and also some files being deployed using these roles (more specifically, my the `/etc/nginx/sites-enabled` files for my `nginx` setup and other similar content).

The original structure was a simple `git` setup that worked well for me while working on configuring these machines. There were also some licensing issues that complicated the matter; some of the content was based on proprietary code written as part of my day-time job (at [Hibox](https://www.hibox.tv)) that I couldn't just share with the world without sorting out the legal matters first.

Now, the time was ready for trying to share some of this with the world. While doing so, I wanted to scrub the repository of all "local configuration"-related stuff, and it turned out there were also some Hibox-specific stuff that should also be cleaned up in the process.

This is actually an area where `git` excels. Its whole worldview revolves around the idea that "history can be rewritten". This particular use case is no exception to that.

I'll describe the steps I took here, in the hope that it will be useful to others. At the end of the blog post I'll also share a link to the resulting GitHub project.

### Step 1: Make a copy of the project

We already concluded early on that you should have a proper backup when doing this. My approach was to copy my local `git` project into a new directory and make a brand new GitHub project out of the result.

```
$ cp -r ansible-config ansible-roles
$ cd ansible-roles
$ git remote remove origin
```

The last command is important, since it makes it impossible to push the end result by mistake. (Well, `git push` would warn you anyway but some of us are too fast for our own good. It's easy to type `git push --force` and realize a few seconds too late that this was _not_ what you should have done...)

### Step 2: Running `git filter-branch`

This is actually quite easy, if you know what files you want to remove. As usual, Stack Overflow has us covered: [this answer](https://stackoverflow.com/a/17824718/227779) describes at length what the flags being used here mean:

```
$ git filter-branch --tree-filter "rm -rf inventory" --prune-empty HEAD
WARNING: git-filter-branch has a glut of gotchas generating mangled history
	 rewrites.  Hit Ctrl-C before proceeding to abort, then use an
	 alternative filtering tool such as 'git filter-repo'
	 (https://github.com/newren/git-filter-repo/) instead.  See the
	 filter-branch manual page for more details; to squelch this warning,
	 set FILTER_BRANCH_SQUELCH_WARNING=1.
Proceeding with filter-branch...

Rewrite f3a0ac802c792a1cdd9e0d1d81b3b5a1396768da (15/27) (1 seconds passed, remaining 0 predicted)
Ref 'refs/heads/master' was rewritten
```

I don't have any personal experience with [git-filter-repo](https://github.com/newren/git-filter-repo/) being referred to here, but it does seem to have some significant advantages to `git filter-branch`. If your use case is non-trivial (unlike my source repo which only had 27 commits), make sure to give it a look. It might be a much better fit for your use case than the tool described here.

### Step 3: Looking at the resulting `git` history

After the filter operation was complete, here's what the history looked like:

```
$ git log --oneline
9752451 (HEAD -> master) bind/coruscant: Move bind config from pi2 to coruscant
02cf6f0 awstats: Add new role, for installing & configuring awstats
bd819e1 owl: Add existing bind config
cb1bb85 inventory: Move public hosting to coruscant
71f4425 bind: Added new role & existing config from pi2
0ca9a71 coruscant: Move nginx overrides to subdirectory
da51040 roles/nginx: Adjustments to match our current setup
7f4707b (README) Add example ansible-playbook command
cf9cec3 Add nginx settings for pi2
6845175 Add nginx role + script for syncing it from the upstream repo
4045c9c first commit
```

There are some interesting facts to consider at this point:

- We still have references to the inventory, host names (`pi2`, `coruscant`, `owl`) etc in the commit log. We want to fix those as well.
- The number of commits is down significantly from 27 in the original repository to 11 commits now. The reason for this is the `--prune-empty` flag we passed to the `git filter-branch` command. It will drop commits which are completely empty (after the filtered files have been removed) from the history, which makes sense most of the time (unless you want to something clever, like edit these commits afterwards and add some other files or whatever).

It can also be useful to look at the git history in a GUI. I'm typically a very command-line-oriented guy, but for things like this, I do think that a proper GUI gives an advantage. It's easier to navigate around, inspecting individual commits (including their changes) in a graphical tool.

 So... `gitk`[^1] to the rescue. Here's what it looks like:

![gitk](/images/2021-06-02-rewriting-git-history-1-gitk.png)

### Step 4: Removing some more files

We are soon ready to start editing the actual commits, but let's run the filtering again to remove some more files first. This is quite easy since it's possible to run `git filter-branch` multiple times in a sort of "incremental" fashion.

```
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --tree-filter "rm -rf .vscode README.md" --prune-empty HEAD
Cannot create a new backup.
A previous backup already exists in refs/original/
Force overwriting the backup with -f
```

We used the `FILTER_BRANCH_SQUELCH_WARNING=1` to get rid of the warning (and delay) discussed above. The operation now failed; `git` is kind enough to refuse to overwrite the backup it created the first time we called `git filter-branch`, unless we _explicitly_ pass it the `-f` flag:

```
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --tree-filter "rm -rf .vscode README.md" --prune-empty HEAD
Rewrite 9752451b210e7f59043fe3218d9fc4635ceadf72 (11/11) (0 seconds passed, remaining 0 predicted)
Ref 'refs/heads/master' was rewritten
```

As we see when looking at the log, this further removed some commits from the history:

```
$ git log --oneline
7ac1048 (HEAD -> master) bind/coruscant: Move bind config from pi2 to coruscant
4009bd8 awstats: Add new role, for installing & configuring awstats
162cbb1 inventory: Move public hosting to coruscant
33eaa2d bind: Added new role & existing config from pi2
76a0197 roles/nginx: Adjustments to match our current setup
2e061ff Add nginx settings for pi2
3c24c4c Add nginx role + script for syncing it from the upstream repo
```

### Step 5: Editing the resulting commits

This is actually not that complex either, but we use a different command than `git filter-branch` for doing this - `git rebase -i` for interactive rebasing. Instead of specifying a specific base commit we use the `--root` parameter, so we can edit even the very first commit if needed.

```
$ git rebase -i --root
```

Here's what it looks like:

![`git rebase`](/images/2021-06-02-rewriting-git-history-2-git-rebase.png)

(If this looks slightly different from your regular `git rebase` session, it's because I use a text-based interactive rebase editor[^2].)

We select the commits we want to edit, something like this:

![`git rebase`](/images/2021-06-02-rewriting-git-history-3-git-rebase.png)

Once we press Enter, we get back to our shell like this:

```
$ git rebase -i --root
Stopped at 2e061ff...  Add nginx settings for pi2
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue
$
```

We want to check what this commit contained; it seems like one of those "inventory-oriented" commits we don't want to keep. `git show --stat` is useful to quickly get an idea of what files a particular commit modified:

```
$ git show --stat
commit 2e061ff65eb7d93cc09b52edd9fbe2ae1fdf5499 (HEAD)
Author: Per Lundberg <perlun@undisclosed-domain>
Date:   Sat Oct 24 08:53:15 2020 +0300

    Add nginx settings for pi2

 ansible.cfg | 3 +++
 1 file changed, 3 insertions(+)
```

Alright, one more file that we don't want in the repo (at least not right now). We abort the rebase and run `git filter-branch` one more time:

```
$ git rebase --abort
$ FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --tree-filter "rm -rf ansible.cfg" --prune-empty HEAD
Rewrite 7ac104882678a169268aa9eef69cd5dc294ecb8a (7/7) (0 seconds passed, remaining 0 predicted)
Ref 'refs/heads/master' was rewritten
```

Now we're talking. The number of commits is now pleasantly low:

```
$ git log --oneline
9ef063d (HEAD -> master) bind/coruscant: Move bind config from pi2 to coruscant
1b5cebb awstats: Add new role, for installing & configuring awstats
6f097ab inventory: Move public hosting to coruscant
401181c bind: Added new role & existing config from pi2
1740f18 roles/nginx: Adjustments to match our current setup
3c24c4c Add nginx role + script for syncing it from the upstream repo
```

We run the rebase once more with `git rebase -i --root` and select the commits we want to edit:

![`git rebase`](/images/2021-06-02-rewriting-git-history-4-git-rebase.png)

Once we confirm our choices by pressing Enter, we are back in the rebase session again:

```
$ git rebase -i --root
Stopped at 3c24c4c...  Add nginx role + script for syncing it from the upstream repo
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue
$
```

The "script for syncing it from the upstream repo" part is not something that's needed any more, so we `git rm scripts/sync_roles_and_playbooks.sh`. After that, we run `git commit --amend`, so we can remove the "script for syncing it from the upstream repo" part from the commit message as well.

![`git rebase`](/images/2021-06-02-rewriting-git-history-5-git-rebase.png)

We can then continue with the rebase, and `git` will stop on all the commits we told it we wanted to edit in the rebase editor:

```
$ git rebase --continue
Stopped at 401181c...  bind: Added new role & existing config from pi2
You can amend the commit now, with

  git commit --amend

Once you are satisfied with your changes, run

  git rebase --continue
$
```

We then iterate using the above process (look at the commit, do changes if needed, `git rm`/`git add` changes, `git commit --amend`, `git rebase --continue`) until the rebase is complete. Just like with the filtering process above, it's also perfectly doable to re-run the rebase again to further refine the result.

### Step 6: Pushing the result to our new GitHub repo

Once we are done with all of the above, let's push it to our newly created GitHub project:

```
$ git push -u origin HEAD
fatal: 'origin' does not appear to be a git repository
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

This error message is expected at this point. Let's add the remote and try again:

```
$ git remote add origin git@github.com:perlun/ansible-roles.git
$ git push -u origin HEAD
Enumerating objects: 62, done.
Counting objects: 100% (62/62), done.
Delta compression using up to 8 threads
Compressing objects: 100% (44/44), done.
Writing objects: 100% (62/62), 7.58 KiB | 1.26 MiB/s, done.
Total 62 (delta 18), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (18/18), done.
To github.com:perlun/ansible-roles.git
 * [new branch]      HEAD -> master
Branch 'master' set up to track remote branch 'master' from 'origin' by rebasing.
```

:tada: The operation is now complete. Our end result is something ready to be shared with other people, and it is in a state we feel comfortable about.

### The end result

Here's a link to the resulting GitHub repo if you're interested: https://github.com/perlun/ansible-roles/. (I'll admit: I did the actual work first, _then_ tried to retrofit it into this blog post. Posting both it & the actual Ansible roles in the hope that it'll be useful to others.)

Alright, time to wrap this up. If you found this useful, please don't hesitate to write a comment below

[^1]: If you want a `git` GUI, [`gitk`](https://**packages**.debian.org/gitk) is one of the few reasonable options available for Linux. However, while writing this, I realized that there is an [unofficial fork of GitHub Desktop](https://github.com/shiftkey/desktop) available for Linux. I guess it could also be useful if you're looking for something like this.

[^2]: https://github.com/sjurba/rebase-editor
