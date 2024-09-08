---
title: Setting up rclone for CSE@UNSW on Arch Linux
layout: post
author: Yankai Zhu
tags: []
---

## Reasons for setting up rclone

- [SSHFS](https://github.com/libfuse/sshfs) has now been archived on GitHub
  - If you still want to use SSHFS, abiramen has a good post [here](https://abiram.me/cse-sshfs)
- The VSCode SSH FS extension doesn't provide intellisense
- Because I can

## Setup SSH keys

```bash
$ cat ~/.ssh/id_ed25519.pub
```

If you see a line that starts with `ssh-ed25519`, that's a key you can use. Otherwise, generate a new key pair with `ssh-keygen -t ed25519`. You can skip the password and if you already have a lot of keys, you should put this new pair in separate files so you don't get rate limited because of too many failed login attempts. If you do put them in separate files, make sure to remember which files those are because we need to reference them with absolute paths later on!

```bash
$ ssh-copy-id z5555555@cse.unsw.edu.au
# Enter your zPass...

$ ssh 'z5555555@cse.unsw.edu.au'
z5555555@vx55:~$ cat ~/.ssh/authorized_keys
# Verify that the key you generated is in the same one
```

Ctrl+D to exit.

## Setup rclone

My home folder is called someretical and yours will probably be something else. So replace someretical with your home folder/user name as necessary.

```
$ yay -Syu rclone
$ rclone config

<5>NOTICE: Config file "/home/someretical/.config/rclone/rclone.conf" not found - using defaults
No remotes found, make a new one?
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n

Enter name for new remote.
name> unswcse

Option Storage.
Type of storage to configure.
Choose a number from below, or type in your own value.
 1 / 1Fichier
   \ (fichier)
...
39 / SSH/SFTP
   \ (sftp)
...
50 / seafile
   \ (seafile)
Storage> 39

Option host.
SSH host to connect to.
E.g. "example.com".
Enter a value.
host> login5.cse.unsw.edu.au (digit after login is the last digit in your zID)

Option user.
SSH username.
Enter a string value. Press Enter for the default (someretical).
user> z5555555 (your zID)

Option port.
SSH port number.
Enter a signed integer. Press Enter for the default (22).
port> (enter)

Option pass.
SSH password, leave blank to use ssh-agent.
Choose an alternative below. Press Enter for the default (n).
y) Yes, type in my own password
g) Generate random password
n) No, leave this optional password blank (default)
y/g/n> (enter)

Option key_pem.
Raw PEM-encoded private key.
If specified, will override key_file parameter.
Enter a value. Press Enter to leave empty.
key_pem> (enter)

Option key_file.
Path to PEM-encoded private key file.
Leave blank or set key-use-agent to use ssh-agent.
Leading `~` will be expanded in the file name as will environment variables such as `${RCLONE_CONFIG_DIR}`.
Enter a value. Press Enter to leave empty.
key_file> /home/someretical/.ssh/id_ed25519 (the ABSOLUTE path to the key pair you generated)

Option key_file_pass.
The passphrase to decrypt the PEM-encoded private key file.
Only PEM encrypted key files (old OpenSSH format) are supported. Encrypted keys
in the new OpenSSH format can't be used.
Choose an alternative below. Press Enter for the default (n).
y) Yes, type in my own password
g) Generate random password
n) No, leave this optional password blank (default)
y/g/n> (enter)

Option pubkey_file.
Optional path to public key file.
Set this if you have a signed certificate you want to use for authentication.
Leading `~` will be expanded in the file name as will environment variables such as `${RCLONE_CONFIG_DIR}`.
Enter a value. Press Enter to leave empty.
pubkey_file> (enter)

Option key_use_agent.
When set forces the usage of the ssh-agent.
When key-file is also set, the ".pub" file of the specified key-file is read and only the associated key is
requested from the ssh-agent. This allows to avoid `Too many authentication failures for *username*` errors
when the ssh-agent contains many keys.
Enter a boolean value (true or false). Press Enter for the default (false).
key_use_agent> (enter)

Option use_insecure_cipher.
Enable the use of insecure ciphers and key exchange methods.
This enables the use of the following insecure ciphers and key exchange methods:
- aes128-cbc
- aes192-cbc
- aes256-cbc
- 3des-cbc
- diffie-hellman-group-exchange-sha256
- diffie-hellman-group-exchange-sha1
Those algorithms are insecure and may allow plaintext data to be recovered by an attacker.
This must be false if you use either ciphers or key_exchange advanced options.
Choose a number from below, or type in your own boolean value (true or false).
Press Enter for the default (false).
 1 / Use default Cipher list.
   \ (false)
 2 / Enables the use of the aes128-cbc cipher and diffie-hellman-group-exchange-sha256, diffie-hellman-group-exchange-sha1 key exchange.
   \ (true)
use_insecure_cipher> (enter)

Option disable_hashcheck.
Disable the execution of SSH commands to determine if remote file hashing is available.
Leave blank or set to false to enable hashing (recommended), set to true to disable hashing.
Enter a boolean value (true or false). Press Enter for the default (false).
disable_hashcheck> (enter)

Edit advanced config?
y) Yes
n) No (default)
y/n>

Configuration complete.
Options:
- type: sftp
- host: login5.cse.unsw.edu.au
- user: z5555555
Keep this "unswcse" remote?
y) Yes this is OK (default)
e) Edit this remote
d) Delete this remote
y/e/d>

Current remotes:

Name                 Type
====                 ====
unswcse              sftp

e) Edit existing remote
n) New remote
d) Delete remote
r) Rename remote
c) Copy remote
s) Set configuration password
q) Quit config
e/n/d/r/c/s/q> q
```

### `fusermount` in PATH

> Since mounting requires the fusermount program, rclone will use the fallback PATH of `/bin:/usr/bin` in this scenario. Please ensure that fusermount is present on this PATH.

If `which fusermount` is not in the above PATH, create a symlink with `ln -s /path/to/original /usr/bin/fusermount`.

### Add entry to `fstab`

First run `id YOUR_USERNAME` to get your uid and gid.

Example output:

```
uid=1000(someretical) gid=1000(someretical) groups=1000(someretical),98(power),998(wheel),987(storage),960(sambashare)
```

The uid and gid are both 1000 in this case.

Then run `rclone config paths` to get the absolute paths to your rclone config file and cache directory.

Example output:

```
Config file: /home/someretical/.config/rclone/rclone.conf
Cache dir:   /home/someretical/.cache/rclone
Temp dir:    /tmp
```

Prepare the following entry and save it to your clipboard:

```
unswcse: /mnt/unswcse rclone noauto,nofail,_netdev,x-systemd.automount,config=/home/someretical/.config/rclone/rclone.conf,cache-dir=/home/someretical/.cache/rclone,allow-other,default-permissions,file-perms=0777,uid=1000,gid=1000,log-file=/tmp/rclone.log 0 0
```

Replace `/home/someretical/.config/rclone/rclone.conf` and `/home/someretical/.cache/rclone` with your config file and cache directory respectively.

Next, run `sudo nvim /etc/fstab` and append the entry to the end of the file. Press the insert key if it seems like you can only move the cursor. When you're done, press escape and type `:wq`.

Run `systemctl list-unit-files --type automount` to see which .automount unit files need to be restarted.

In my case, I would run:

```
$ sudo systemctl restart proc-sys-fs-binfmt_misc.automount
$ sudo systemctl daemon-reload
```

The daemon-reload is necessary no matter what. If you still can't see `/mnt/unswcse` after this, restart your computer with `sudo reboot`.

Now you should be able to access your CSE folder through `/mnt/unswcse`. You should also be able to execute binaries you've compiled on there as well. We set up the fstab entry so that the CSE folder will be automatically mounted when we try and access it (it's not mounted on boot). This should make it easier to recover if the network cuts out briefly.

## Create CSE alias

Add the following snippet to the end of your `.bashrc` or `.zshrc` or whatever file:

```bash
# code snippet copied from https://abiram.me/cse-sshfs#adding-our-aliases

# Your zID (change this)
_SSHFS_ZID=z5555555
# Your desired mountpoint for your CSE home directory
_SSHFS_CSE_MOUNT=/mnt/unswcse

function cse() {
    # determine where we are relative to the mountpoint (thanks @ralismark)
    local rel=${PWD##${_SSHFS_CSE_MOUNT}}

    if [ -z "$1" ]; then
        # if we don't have arguments, we give the user a shell on the remote cse machine.
        if [ "$PWD" = "$rel" ]; then
            # in the case that we're not in our mountpoint, provide a shell in their home directory.
            ssh "${_SSHFS_ZID}@login${_SSHFS_ZID: -1}.cse.unsw.edu.au"
        else
            # if within the mountpoint, cd to the equivalent dir on the remote before providing a shell (thanks @ralismark)
            ssh "${_SSHFS_ZID}@login${_SSHFS_ZID: -1}.cse.unsw.edu.au" -t "cd $(printf "%q" "./$rel"); exec \$SHELL -l"
        fi
    else
        # if we have arguments, we have a command to execute.
        if [ "$PWD" = "$rel" ]; then
            # in the case that we're not in our mountpoint, we'll execute in the home directory.
            ssh -qt "${_SSHFS_ZID}@login${_SSHFS_ZID: -1}.cse.unsw.edu.au" "$@"
        else
            # if within the mountpoint, cd to the equivalent dir on the remote before executing (thanks @ralismark)
            ssh "${_SSHFS_ZID}@login${_SSHFS_ZID: -1}.cse.unsw.edu.au" -qt "cd $(printf "%q" "./$rel") && $(printf "%q " "$@")"
        fi
    fi
}
```

This will let you run commands like

```
$ cse 1511
$ cse give
$ cse 1531
```

in your local terminal without the hassle of typing out ssh ...
