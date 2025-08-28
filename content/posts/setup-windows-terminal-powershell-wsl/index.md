---
title: Setting up Windows Terminal, Powershell and WSL
date: 2025-08-27
summary: Windows Terminal, Powershell and WSL
tags: ["windows", "wsl", "powershell"]
---

Recently, my Windows C drive has been running out of storage and I figured I barely used the Linux partition anyway so I decided to reinstall Windows. Of course, this means I need to set up my development environment again.

## Install ArchWSL

1. `wsl --update`

2. Download the .wsl file from `https://geo.mirror.pkgbuild.com/wsl/latest`.

3. `wsl --install --from-file "D:\WSL\archlinux-2025.08.01.138229.wsl" --location "D:\WSL\" --name "archlinux"`
    - `--from-file` is your downloaded .wsl file
    - `--location` is where the virtual drive should be located
    - `--name` is what we'll call the distribution

If it doesn't work, reboot and try again. Make sure Hyper-V is enabled.

4. Install basic packages and setup the user.
```
# pacman -Syu base-devel shadow zsh neovim sudo unzip git git-zsh-completion
# passwd (set password for root)
# useradd -m [USERNAME]
# passwd [USERNAME]
# usermod -aG wheel,storage,power [USERNAME]
```

5. `nvim /etc/sudoers` and uncomment the line `%wheel ALL=(ALL) ALL`.

6. `# nvim /etc/wsl.conf` and add to the end.

```ini
[user]
default=one
```

7. `nvim /etc/pacman.conf`
    - Uncomment color
    - Comment NoProgressBar
    - Set ParallelDownloads = 5
    - Add ILoveCandy (by itself)

```ini
Color
# NoProgressBar
ParallelDownloads = 5
ILoveCandy
```

8. `nvim /etc/locale.gen` and uncomment the line `en_US.UTF-8 UTF-8`.

9. `echo LANG="en_US.UTF-8" > /etc/locale.conf`

10. `locale-gen`

11. Using Powershell, run `wsl --terminate archlinux`.

## Windows Terminal Setup

1. Install `CaskaydiaCove Nerd Font` from https://www.nerdfonts.com/font-downloads and use the Mono Nerd Font version for Windows Terminal. 
    - Mono means no ligatures
    - Nerd Font means it includes the powerline symbols

2. Shift click settings button in Windows terminal to open settings.json.

3. Add the following to the schemes array (not themes) and select the newly added theme.

```json
{
  "name" : "Gruvbox Dark",
  "background" : "#282828",
  "black" : "#282828",
  "blue" : "#458588",
  "brightBlack" : "#928374",
  "brightBlue" : "#83A598",
  "brightCyan" : "#8EC07C",
  "brightGreen" : "#B8BB26",
  "brightPurple" : "#D3869B",
  "brightRed" : "#FB4934",
  "brightWhite" : "#EBDBB2",
  "brightYellow" : "#FABD2F",
  "cyan" : "#689D6A",
  "foreground" : "#EBDBB2",
  "green" : "#98971A",
  "purple" : "#B16286",
  "red" : "#CC241D",
  "white" : "#A89984",
  "yellow" : "#D79921"
}
```

4. Add the following to the font section to properly disable ligatures.

```json
"features": 
{
    "calt": 0
}
```

## Powershell Setup

1. `winget install JanDeDobbeleer.OhMyPosh --source winget --scope user --force`

2. Restart the terminal for the PATH to be updated.

3. Copy the output of `(Get-Command oh-my-posh).Source` and add it to the Windows defender exclusion list.

4. `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine` to allow unsigned scripts to run. This may require an admin terminal.

5. `New-Item -Path $PROFILE -Type File -Force` create a new profile.

6. The profile can be found at `~/Documents/Powershell/`. Add `oh-my-posh init pwsh --config "gruvbox" | Invoke-Expression` to it.


## WSL Setup

1. `sudo chsh -s /usr/bin/zsh`

2. Restart WSL and then skip the setup for zsh.

3. `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"`

4. `git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`

5. `git clone https://aur.archlinux.org/yay-bin.git && cd yay-bin && makepkg -si && yay -Syu` install `yay`.

6. `yay -S fortune-mod cowsay lolcat lsd`

7. Add the following to `~/.zshrc`. Edit the default user as required.

```zsh
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
setopt beep extendedglob notify
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/one/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH

# Path to your Oh My Zsh installation.
export ZSH="$HOME/.oh-my-zsh"

DEFAULT_USER=one

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time Oh My Zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="agnoster"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.

# git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
plugins=(git zsh-autosuggestions)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='nvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch $(uname -m)"

# Set personal aliases, overriding those provided by Oh My Zsh libs,
# plugins, and themes. Aliases can be placed here, though Oh My Zsh
# users are encouraged to define aliases within a top-level file in
# the $ZSH_CUSTOM folder, with .zsh extension. Examples:
# - $ZSH_CUSTOM/aliases.zsh
# - $ZSH_CUSTOM/macos.zsh
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"

# alias ohmyzsh="mate ~/.oh-my-zsh"

alias ls='lsd'
alias l='ls -l'
alias la='ls -a'
alias lla='ls -la'
alias lt='ls --tree'
alias lta='ls --tree -la'

# customize python venv prefixes
export VIRTUAL_ENV_DISABLE_PROMPT=1

fortune | cowsay | lolcat
```

8. Restart the terminal

## Git setup

The steps are the same for all platforms.

1. `git config --global gpg.format ssh`
2. `ssh-keygen -t ed25519` if you don't already have a key.
3. Add the key to Github/Gitlab/whatever if you haven't already. You can add it as both signing and authenticating.
4. `git config --global user.signingkey ~/.ssh/id_ed25519.pub`
5. `git config --global commit.gpgsign true`
6. `git config --global tag.gpgsign true`
7. `git config --global format.signoff true` this is for Developer Certificate of Origin (DCO) or commit signoff policy (enforced by organization owners and repository admins).
8. `git config --global user.name someretical`
9. `git config --global user.email "29365738+someretical@users.noreply.github.com"`
