# Day 1: Version Control Mastery (Git)

As a DevOps Engineer, source control is the foundation of everything you do. You will constantly deal with code integration, resolving merge conflicts, and fixing broken histories. This document contains real-life scenarios and commands you will use daily.

## 1. The Merge Conflict Scenario 🥊

**Real-Life Scenario:** Two developers are working on the exact same microservice file. Dev A pushes first. You (Devops) try to merge Dev B's work, but Git stops you because the code overlaps.

**The Workflow:**
1. Git stops the merge and says: `Automatic merge failed; fix conflicts and then commit the result.`
2. You open the conflicting file. Git highlights the conflict using these markers:
   ```xml
   <<<<<<< HEAD
   <!-- Dev B's Code -->
   =======
   <!-- Dev A's Code -->
   >>>>>>> feature/developer-1
   ```
3. You manually delete the `<<<<<<<`, `=======`, and `>>>>>>>` text, editing the code to combine the logic safely.
4. Finalize the merge:
   ```bash
   git add <file>
   git commit -m "Resolved merge conflict"
   ```

---

## 2. Advanced Integration Commands

### `git rebase main`
* **Real-Life Scenario:** A developer's feature branch is 2 weeks old and severely out of date with `main`, causing deployment errors.
* **What it does:** Instead of a messy merge commit, it temporarily removes the developer's commits, pulls down the absolutely newest version of `main`, and then reapplies their commits cleanly on top. Linear history!

### `git cherry-pick <commit-hash>`
* **Real-Life Scenario:** A critical bug breaks the production login page. A developer fixes it in the `develop` branch, but `develop` isn't ready to release yet.
* **What it does:** Copies *only that specific commit* from `develop` and pastes it directly onto `main`, allowing you to deploy the hotfix immediately without releasing unfinished features.

### `git bisect`
* **Real-Life Scenario:** Jenkins says the build is broken. Nobody knows who broke it. There have been 45 commits today.
* **What it does:** Automates the search for the broken commit using a math binary search.
  ```bash
  git bisect start
  git bisect bad         # Tell Git the current commit is broken
  git bisect good abc123 # Tell Git an older commit that definitely compiled
  ```
  Git will checking out halfway points and ask you if it works, isolating the exact breaking commit in ~5 steps.

---

## 3. The "Undo" Button (Fixing Mistakes)

* **Local Mistake (Not pushed yet):**
  * `git reset --soft HEAD~1`: Uncommits your last change but keeps the files in your editor so you can fix them.
  * `git reset --hard HEAD~1`: ☢️ DANGER. Completely obliterates your last commit and destroys the file changes forever.
* **Production Mistake (Already pushed to GitHub):**
  * `git revert <commit-hash>`: **Never use `reset` on live shared branches.** `revert` creates a brand new "anti-commit" that undoes the changes natively. It protects the repository history so nobody else's computer breaks.

---

## 4. Cleaning Up the Workspace

* **Real-Life Scenario:** Your local terminal shows 50 branches, but 48 of them were already merged on GitHub and deleted by PR reviewers.
* **The Fix:**
  * `git fetch -p`: (Prune). This silently reaches out to GitHub and deletes all the local phantom tracking references (`origin/old-branch`).
  * `git branch -d <branch-name>`: Safely deletes the branch on your local hard drive. Use `-D` to force delete it even if it isn't officially merged.
