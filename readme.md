# CurveFever

# Git flow

## Branches

### Main

For production code only. The main branch, is supposed to be **behind** the develop branch.

#### To enter branch

`git checkout main`

### Develop

For all development, testing etc. For larger commits/changes, create a feature branch. For small fixes and non-breaking stuff, commit directly.

#### To enter branch

`git checkout develop`

### Feature/xxx

Use a feature branch for implementing larger compontens.

#### Creating a feature

Use `git flow feature start MYFEATURE` where MYFEATURE is the branch name. Eg. "UI-refactor", "database" etc.

#### Finishing a feature

When finishing a feature, it gets merged with the develop branch.

`git flow feature finish MYFEATURE`

## Merging to main from develop

To get code, from `develop` to `main`, do the following:

1. `git checkout develop`
   --\* Enter the develop branch
2. `git merge main`
   --_ Merge `main` branch into `develop`. This ensures that potential conflicts **gets resolved in develop**. If theres no conflict, proceed.
   --_ Update version in `package.json` to a newer version.
3. `git checkout main` & `git merge develop`

# Builds

## Production

[Linefever](https://linefever.ollioddi.dk)

Build runs on:

-   Changes to version in package.json
-   Main branch

## Develop

[Linefever](https://betafever.ollioddi.dk)

Build runs on:

-   Every change
-   Develop branch

[![Build Status](https://drone.ollioddi.dk/api/badges/P2-AAU-SW2/Curve-Fever/status.svg?ref=refs/heads/develop)](https://drone.ollioddi.dk/P2-AAU-SW2/Curve-Fever)
