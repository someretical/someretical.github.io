---
title: Using the PS5 DualSense with Arch Linux
layout: post
author: Yankai Zhu
tags: []
---

The DualSense wireless controller is *supposed* to work out of the box for Linux, Windows and MacOS but this isn't really the case.

- During testing, only MacOS worked seamlessly out of the box which is kind of ironic given the whole gaming on MacOS thing.
- On Windows, some of the controls were not mapped properly which was annoying. I had to install additional mapping software like [DualSenseX](https://dualsensex.com/download/). The worst part is probably the fact that there exists a [https://store.steampowered.com/app/1812620/DSX/](*paid* version) of this software which is on Steam. However, I am aware of open source alternatives such as [DS4Windows](https://ds4-windows.com/) but I haven't tried it.
- Getting it working properly on Linux was the most tedious experience out of all of operating systems tested.

The testing involved pairing the device and visiting [https://gamepadtest.com/](https://gamepadtest.com/) and pressing all the buttons on the controller to see what effect they have. Usually when it's broken it means you press on button and the websites show you pressed/moved either the wrong button/joystick or *more than one of them*.

The main part of this post is dedicated to getting the controller work on Arch Linux since that is currently my daily driver.

Firstly, check your `bluez` package version. As per this [recent (as of writing) thread](https://bbs.archlinux.org/viewtopic.php?id=288754), both versions 5.70 *and* 5.69 are broken with respect to connecting to the controller. As such you will need to downgrade the following packages `bluez bluez-libs bluez-utils` to version 5.68. Make sure to downgrade to that version and only that version because in my research I found similar issues reported with earlier versions. The easiest way to downgrade is to install the `downgrade` package which makes it ridiculously easy to down/upgrade packages. It even helps you add packages to the pacman ignore list.

Then run `lsmod | grep hid`. If you see the line `hid_playstation`, then you're all good. If not, run
```
# modprobe hid-playstation
```
to load the appropriate kernel module for the controller. Afterwards, running `lsmod | grep hid` should return a list similar to the following one:
```
hidp                   36864  0
hid_logitech_hidpp     77824  0
bluetooth            1114112  45 btrtl,hidp,btmtk,btintel,btbcm,bnep,btusb,rfcomm
hid_logitech_dj        40960  0
mac_hid                12288  0
hid_playstation        45056  0
led_class_multicolor    16384  1 hid_playstation
ff_memless             20480  1 hid_playstation
usbhid                 77824  2 hid_logitech_dj,hid_logitech_hidpp
```
It's normal to notice more than one module to appear since there are dependencies present. To make the kernel load the module on boot, create/update the following file:
```
# vim /etc/modules-load.d/hid-playstation.conf

# add the following line to the file:
hid_playstation
```
Then, create/update the following file:
```
# vim /etc/bluetooth/input.conf

# add the following line to the file:
UserspaceHID=true
```
Then restart your computer for good measure. Apparently running `systemctl restart bluetooth.service` should also work but I haven't tested that method directly.

Afterwards, you can using `bluetoothctl` to connect to the controller. Then run `scan on` to show all Bluetooth events. To enable the controller's pairing mode, hold the the PlayStation logo button as well as the small button in the upper middle right region with a torch/loud sound icon next to it for five seconds. The light on the controller should start pulsing blue in sequences of two. Then look for a `new` event with the name `DualSense wireless controller` in it and copy paste the MAC address associated with it and run `connect [address]`. The pairing should be successful.

To play games, it's recommended to use Steam with proton since it seamlessly maps everything for you. If you don't want to use Steam, there is a CLI mapper tool called `dualsensectl` which is installed via the `dualsensectl-git` package on the AUR. However, I have not used that tool, I only know it exists.

For more information, see the Arch wiki page for [Gamepads](https://wiki.archlinux.org/title/Gamepad).