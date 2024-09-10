---
title: Lessons and notes on reinstalling Windows 11
date: 2023-12-02
draft: false
summary: Lessons and notes on reinstalling Windows 11
tags: ["windows"]
---

The Windows installer exhibits some interesting behaviour regarding detecting partitions. It seems that

- if there are no existing partitions on the drive you want to install Windows on, then it will create a 100 MB boot partition at the start followed by a 16MB system "reserved" partition (for what exactly I am not sure) and then a recovery partition at the end of the drive/superblock. Everything in the middle belongs to the actual NTFS partition the user interacts with most of the time.
- if there is an existing boot partition, it doesn't create any new partitions and just installs Windows into the one you selected. I only chose to wipe the Windows partition and not the boot partition which also contained grub. Despite everything I had read online about Windows not caring and overwriting grub, this did not happen to me. This may be because I manually set the boot order in my BIOS but I am not sure.
- the only action you can't undo in the installer (apart from actually installing Windows) seems to be formatting partitions. If you quit the installation process, it restores the partitions for you but if you already formatted them then they stay formatted.

## Other notes

- If you do not connect to the internet during the installer wizard, you will have to install your WLAN drivers manually which is pretty annoying.
- Make sure to update "App Installer" in the Microsoft Store before trying to run `winget` otherwise it just chokes.
- WSL2 has had support for using systemd for a while at this point. See [this devblog](https://devblogs.microsoft.com/commandline/systemd-support-is-now-available-in-wsl/) for more details.
- It is rather remarkable how well Windows 11 _seems_ to run on the surface. The UI is rather well polished and the average user would probably never notice anything wrong with it. It's only when you start digging a little deeper that all the idiosyncrasies become glaringly obvious. The only difference with Linux in this regard is that it forces you to get familiar with its own idiosyncrasies straight up.
- The default wallpapers are quite stunning.
- `winget` provides a rather convenient interface for installing packages from the "Microsoft version of the AUR." You just have to be careful about installing packages published by trusted authors. There are a lot of publishers with less-than-trustworthy signatures out there.
- The only use for Microsoft Edge seems to be for installing an alternate browser still.
