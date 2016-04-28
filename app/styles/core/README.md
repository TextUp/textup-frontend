# Textup Styles

These are the core Sass styles shared by all TextUp repositories that have a user interface that needs to be styles with similar conventions.

## Prerequisites

Conventially, changes to this central repository come from backports from other repositories that have added this as a subtree. If you want to update this repository directly, the Sass website has a [list of wrappers for the libsass library](http://sass-lang.com/libsass) that can be used to compile these styles.

## How to add as subtree

All of the following steps take place in the **root of another repository that you would like to add these core styles to**. Do not run these command from the root of this repository.

1. Add a remote for these core styles `git remote add styles git@github.com:TextUp/textup-site.git`
2. Identify the folder where you would like to add the subtree and run `git subtree add -P <path/to/subtree> --squash styles master`

[More details about all git-subtree related commands can be found at this tutorial](https://medium.com/@porteneuve/mastering-git-subtrees-943d29a798ec#.s0lfst7jk)
