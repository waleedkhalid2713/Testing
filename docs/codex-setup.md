# Codex Git Setup

Automation can fail if the repo lacks an `origin` remote or is not on the expected
`main` branch. Use the script below to ensure the repository is configured.

## Recommended setup

```sh
./scripts/ensure-git-setup.sh
```

## What the script does

- Switches to (or creates) the `main` branch.
- Adds the `origin` remote if missing.
- Prints `git status -sb` and `git remote -v` so you can verify.

## Manual steps

If you prefer to do it manually:

```sh
git checkout -B main
git remote add origin https://github.com/waleedkhalid2713/friendly-greetings.git
git status -sb
git remote -v
```
