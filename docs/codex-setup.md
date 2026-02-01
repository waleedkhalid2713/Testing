# Codex Git Setup

This repo was missing a Git remote and a `main` branch, which can prevent automation
(Codex or CI) from applying or pushing changes. Use the steps below to ensure the
expected Git configuration is present.

## Recommended setup

```sh
git checkout -B main
git remote add origin https://github.com/waleedkhalid2713/friendly-greetings.git
```

## Verify configuration

```sh
git status -sb
git remote -v
```
