---
title: Installing Arch Linux alongside Windows 11
layout: post
author: Yankai Zhu
tags: []
---

First, obtain a USB and install [Ventoy](https://www.ventoy.net/en/index.html) on it. Then download the Arch Linux ISO and copy it onto the USB. 

Before we boot from the live USB, open up the partition manager on Windows and create a new partition for Arch Linux on your boot drive. We are doing this step on Windows because it's much more user friendly than the Arch Linux command line setup environment. All you need to do is create the new partition with a reasonable size (such as 100gb). You do not need to format it or give it a name.

Next, make sure you know how to enter the BIOS menu when you boot up your computer. Also make sure you disable secure boot. If you don't, you will have to enrol the key provided by Ventoy.

Now boot from the USB and select the Arch Linux ISO.

If a command has a `#` in front of it, then it should be run as a root user. A `$` denotes a regular user.

## Connect to internet
```
# ip a
```
Shows all the hardware network addresses
- `lo` can be ignored
- `ethernet` is usually `enp5s0`
- `wifi` is usually `wlan0`, can also be `wlo1`

If the wireless network adaptor is in a DOWN state, try running
```
# rfkill unblock wlan
# rfkill unblock bluetooth
# ip link set wlan0 up
```

For more information, see https://wiki.archlinux.org/title/Network_configuration/Wireless

```
# iwctl
```
Launches the internet wireless daemon configurator.

```
# station wlan0 scan
# station wlan0 get-networks
# station wlan0 connect "NETWORK NAME"
```
Replace `wlan0` with other address if necessary. Enter the right password for the internet as required.

CTRL+D to exit `iwctl`.

```
# ip a
```
Confirm the address has "state UP" in its description.

In the example output, notice how `wlo1` has state UP:

```
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: enp5s0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN group default qlen 1000
    link/ether d8:bb:c1:a2:77:d1 brd ff:ff:ff:ff:ff:ff
3: wlo1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether cc:15:31:7c:e5:98 brd ff:ff:ff:ff:ff:ff
    altname wlp0s20f3
    inet 192.168.1.105/24 brd 192.168.1.255 scope global noprefixroute wlo1
       valid_lft forever preferred_lft forever
    inet6 fe80::61b6:6070:40:5bae/64 scope link
       valid_lft forever preferred_lft forever
    inet6 fe80::9947:8129:9cc6:9b5f/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```

Give the Arch Linux website a ping!
```
# ping -c 5 archlinux.org
```

## Check UEFI
```
# ls /sys/firmware/efi/efivars
```
If there is a whole bunch of text printed, then the BIOS is running UEFI. This guide only supports UEFI!

## Check time and date
```
# timedatectl status
```
Check if the time is correct. If it is, the skip the rest of this section.

```
# timedatectl list-timezones
# timedatectl set-timezone Australia/Sydney
```
First command is optional if you already know which timezone you want.

## Partitioning
```
# lsblk
```
Lists all block devices connected to the computer.

The live USB probably has the smallest size so it shouldn't be too hard to find it.

In the example output below, you can see `nvme0n1p1` is the Windows boot partition. We can ignore `nvme0np2` because it is too small to be the partition we created. `nvme0n1p3` is the Windows partition. So the partition we created earlier should be sandwhiched between `nvme0n1p3` and whatever partition is last because the last one is the Windows recovery environment.


Note that I have already installed Arch Linux onto `nvme0n1p4`, hence why the mountpoint is `/`.
```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    0   1.8T  0 disk
├─sda1        8:1    0    16M  0 part
└─sda2        8:2    0   1.8T  0 part /mnt/EA2CEB442CEB0B01
sdb           8:16   0 119.2G  0 disk
└─sdb1        8:17   0 119.2G  0 part /mnt/50B03BA0B03B8C0A
nvme0n1     259:0    0 465.8G  0 disk
├─nvme0n1p1 259:1    0   100M  0 part /mnt/7A6E-4989
├─nvme0n1p2 259:2    0    16M  0 part
├─nvme0n1p3 259:3    0 146.5G  0 part /mnt/C0D06EBDD06EB974
├─nvme0n1p4 259:4    0 146.5G  0 part /
└─nvme0n1p5 259:5    0   633M  0 part
```

To see more information about the devices, run the following commands:
```
# fdisk -l
# hdparm -i /dev/[DEVICE]
```

Example output:
```
Disk /dev/nvme0n1: 465.76 GiB, 500107862016 bytes, 976773168 sectors
Disk model: Sabrent Rocket 4.0 500GB
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 5C435EEC-1FB4-406A-8EB5-2699EB32ECEE

Device             Start       End   Sectors   Size Type
/dev/nvme0n1p1      2048    206847    204800   100M EFI System
/dev/nvme0n1p2    206848    239615     32768    16M Microsoft reserved
/dev/nvme0n1p3    239616 307439615 307200000 146.5G Microsoft basic data
/dev/nvme0n1p4 307439616 614639615 307200000 146.5G Linux filesystem
/dev/nvme0n1p5 975474688 976771071   1296384   633M Windows recovery environment
```
We do not want to touch anything anything with EFI, Microsoft or Windows in the type column. Notice how I have already formatted `nvme0n1p4` which is why it displays Linux Filesystem. If the type is blank and the size matches the size you allocated when you created the partition then it should be all good to format.

If we do create a new partition using fdisk, then select `x` and then `f` to fix the partition ordering if necessary.

Now we format the partition we selected. Make sure you have selected the right one otherwise you could lose very important data! Since we are installing Arch alongside W11, we don't need to format the EFI partition.
```
# mkfs.ext4 /dev/[DEVICE]
```

Now we mount the partition we just formatted:
```
# mount /dev/[DEVICE] /mnt
```

**Don't mount the EFI one yet!!!**

## Get fastest mirrors
```
# cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak
# ls /etc/pacman.d
# pacman -Sy
# pacman -S pacman-contrib
# rankmirrors -n 10 /etc/pacman.d/mirrorlist.bak > /etc/pacman.d/mirrorlist
```
This will optimise the pacman mirror list so we try to use the mirror closest to us for faster download speeds. It will take a while though. The upside is that we don't end up trying to connect to some far away server and end up with a really slow download speed.

## Install Arch
```
# pacstrap -i /mnt base base-devel linux linux-headers linux-firmware intel-ucode networkmanager pulseaudio neovim sudo dhcpcd git vulkan-radeon
```
This will take a while...

I have an Intel processor so I included the `intel-ucode` package. `vulkan-radeon` is for the AMD GPU.

For AMD CPUs, use `amd-ucode` and for NVIDIA GPUs see https://wiki.archlinux.org/title/NVIDIA.

## Generate fstab
```
# genfstab -U /mnt
# genfstab -U /mnt >> /mnt/etc/fstab
```
Makes linux mount the device at startup.

**At this point, the boot partition will not be listed because it hasn't been mounted!**

## Change root
```
# arch-chroot /mnt /bin/bash
```
Change root from live USB to root partition.

```
# systemctl enable NetworkManager
# systemctl enable dhcpcd
```
Enable internet on startup.

## Account setup
```
# passwd
```
Set password for root account.

```
# useradd -m [USERNAME]
# passwd [USERNAME]
# usermod -aG wheel,storage,power [USERNAME]
# visudo
```
Uncomment the line `%wheel ALL=(ALL) ALL`
- Press INSERT to go to replace mode so that it can be edited properly
- Press ESC, then type `:wq` to save the file

```
# nvim /etc/locale.gen
```
Uncomment the lines with `en_GB.UTF8` and `en_US.UTF8`

```
# echo LANG="en_GB.UTF-8" > /etc/locale.conf
# locale-gen
# export LANG="en_GB.UTF-8"
# echo [HOSTNAME] > /etc/hostname
```

> The hostname should be composed of up to 64 7-bit ASCII lower-case alphanumeric characters or hyphens forming a valid DNS domain name. It is recommended that this name contains only a single label, i.e. without any dots. Invalid characters will be filtered out in an attempt to make the name valid, but obviously it is recommended to use a valid name and not rely on this filtering.

Open Vim again:
```
# nvim /etc/hosts
```
Add the lines:
```
127.0.0.1    localhost
::1    localhost
127.0.1.1    [HOSTNAME].localdomain    localhost
```
**Make sure the hostname matches!**

```
# ln -sf /usr/share/zoneinfo/Australia/Sydney /etc/localtime
# hwclock --systohc
```

## Install GRUB
```
# mkdir /boot/efi
# mount /dev/[BOOT_PARTITION] /boot/efi
# pacman -S grub os-prober efibootmgr dosfstools mtools
# nvim /etc/default/grub
```
Make sure the boot partition is actually the boot partition. Usually this would be the first one (both logically and physically) and 100mb in size.

Using nvim, uncomment the line `GRUB_DISABLE_OS_PROBER=false`.

Then run:
```
# grub-install --target=x86_64-efi --bootloader-id=grub_uefi --recheck
# grub-mkconfig -o /boot/grub/grub.cfg
```
**os-prober will probably not detect W11 at this point. This is fine.**

```
# exit
# umount -R /mnt
# reboot
```
Remove the USB after the computer shuts off.

When it turns back on, enter the BIOS and move `grub_uefi` to the top priority of boot order.

Upon booting again, log in, and run the following again:
```
# mount /dev/[BOOT_PARTITION] /boot/efi
# grub-install --target=x86_64-efi --bootloader-id=grub_uefi --recheck
# grub-mkconfig -o /boot/grub/grub.cfg
```
os-prober should now detect W11.

## Connect to the internet (again)
```
$ nmtui
```
Navigate the interface and connect to your network of choice.

### Predictable names

`ip a` might show `wlo1` instead of `wlan0` at this point. This is expected as `wlo1` is a predictable name while `wlan0` is not.

## Install `yay`

```
$ mkdir Downloads/
$ cd Downloads/
$ git clone https://aur.archlinux.org/yay.git
$ cd yay
$ makepkg -si
$ yay --version
$ yay -Syu
```

## Install desktop environment

I will be installing KDE. Check out https://wiki.archlinux.org/title/KDE for more detailed instructions.
```
$ yay -S xf86-video-amdgpu xorg-server
$ yay -S plasma-meta kde-applications zsh

# For a more conservative install
$ yay -S kde-graphics-meta kde-multimedia-meta kde-network-meta kde-system-meta kde-utilities-meta zsh

$ sudo systemctl enable sddm.service
$ sudo systemctl start sddm.service

# Open KRunner with the Meta key
$ kwriteconfig5 --file kwinrc --group ModifierOnlyShortcuts --key Meta "org.kde.krunner,/App,,toggleDisplay"
$ qdbus org.kde.KWin /KWin reconfigure
```

## Install `pure-prompt`
```
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# git clone https://github.com/sindresorhus/pure.git "$HOME/.oh-my-zsh/pure"
```

Set `ZSH_THEME=""` in your `.zshrc` to disable oh-my-zsh themes.

Add the following after `"source $ZSH/oh-my-zsh.sh"` in `.zshrc`:
```
fpath+=($HOME/.oh-my-zsh/pure)
autoload -U promptinit; promptinit
prompt pure
```

## Set up smb share

For more details see https://wiki.archlinux.org/title/Samba

```
$ yay -S nss-mdns
$ sudo vim /etc/nsswitch.conf

# Add/edit the following line
hosts: mymachines mdns_minimal [NOTFOUND=return] resolve [!UNAVAIL=return] files myhostname dns

$ sudo systemctl enable avahi-daemon.service
$ sudo systemctl start avahi-daemon.service

$ sudo nvim /etc/samba/smb.conf

# Add the following lines
[global]
  usershare path = /var/lib/samba/usershares
  usershare max shares = 100
  usershare allow guests = yes
  usershare owner only = yes

$ sudo smbpasswd -a $USER
$ sudo mkdir /var/lib/samba/usershares
$ sudo groupadd -r sambashare
$ sudo chown root:sambashare /var/lib/samba/usershares
$ sudo chmod 1770 /var/lib/samba/usershares
$ sudo gpasswd sambashare -a $USER

$ sudo systemctl enable smb.service
$ sudo systemctl start smb.service
$ sudo systemctl enable nmb.service
$ sudo systemctl start nmb.service
$ sudo reboot
```

## Setup themes
```
$ sudo pacman -S kvantum-qt5

$ git clone https://github.com/vinceliuice/WhiteSur-icon-theme.git
$ cd WhiteSur-icon-theme
$ ./install.sh

$ git clone https://github.com/vinceliuice/WhiteSur-cursors.git
$ cd WhiteSur-cursors
$ ./install.sh

$ git clone https://github.com/vinceliuice/WhiteSur-kde.git
$ cd WhiteSur-kde
$ ./install.sh

$ nvim ~/.local/share/plasma/desktoptheme/WhiteSur-dark/metadata.desktop

# Add the following lines:
[ContrastEffect]
contrast=2.0

[BlurBehindEffect]
enabled=false
```

## Discord clone

```
$ sudo nvim /usr/share/applications/discordclone.desktop

# Add the following lines
[Desktop Entry]
Name=Discord Clone
StartupWMClass=discord
Comment=All-in-one voice and text chat for gamers that's free, secure, and works on both your desktop and phone.
GenericName=Internet Messenger
Exec=/bin/bash -c "export XDG_CONFIG_HOME=~/.config/discord/CLONE; export TMPDIR=~/.config/discord/CLONE; /usr/bin/discord"
Icon=discord
Type=Application
Categories=Network;InstantMessaging;
Path=/usr/bin
```

There is a big issue with this approach, namely certain desktop environment settings cannot be accessed the right way.
- The default web browser is reset to Konqueror
- File dialogs are always light theme

There is no solution to the second but for the first, uninstaller the `kde-network-meta` package to uninstall Konqueror. There are a few more applications in the default web browser category which also need to be uninstalled for Discord to open links with Firefox by default.

## Install Rust

```
$ yay -S rustup
$ rustup default stable
```

## Install Spotify adblocker

Make sure to log into Spotify at least once before!

```
$ git clone https://github.com/abba23/spotify-adblock.git
$ cd spotify-adblock
$ make
$ sudo make install

$ sudo nvim /usr/share/applications/spotify-adblock.desktop

# Add the following lines
[Desktop Entry]
Type=Application
Name=Spotify (adblock)
GenericName=Music Player
Icon=spotify-client
TryExec=spotify
Exec=env LD_PRELOAD=/usr/local/lib/spotify-adblock.so spotify %U
Terminal=false
MimeType=x-scheme-handler/spotify;
Categories=Audio;Music;Player;AudioVideo;
StartupWMClass=spotify
```
