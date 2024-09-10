---
title: Using the Office Deployment Tool (ODT)
date: 2023-12-01
summary: Using the Office Deployment Tool (ODT)
tags: ["windows", "odt"]
---

Happy December everyone!

This probably seems like a bit of a weird way to kick off December, but I have been preparing to reinstall both Windows and Arch on my desktop so it seemed apt to document some of the things that I have done on both operating systems.

The Office Deployment Tool (ODT) is supposed to be used by IT administrators to deploy the Microsoft Office Suite in an enterprise environment. As such, Microsoft is incentivised to make the process as configurable and streamlined as possible. In short, the experience you get with the ODT is very different to the experience you would get from trying to install the retail version of Microsoft Office (which has proven much more difficult to customise).

To download the tool, visit [https://www.microsoft.com/en-us/download/details.aspx?id=49117](https://www.microsoft.com/en-us/download/details.aspx?id=49117). If the link breaks, try [https://learn.microsoft.com/en-gb/deployoffice/overview-office-deployment-tool#download-the-office-deployment-tool](https://learn.microsoft.com/en-gb/deployoffice/overview-office-deployment-tool#download-the-office-deployment-tool) instead and follow the prompts.

Place the `config.xml` file in the same directory as `setup.exe`.

```xml
<!-- Office 365 client configuration file sample. To be used for Office 365 ProPlus apps,
     Office 365 Business apps, Project Pro for Office 365 and Visio Pro for Office 365.

     For detailed information regarding configuration options visit: http://aka.ms/ODT.
     To use the configuration file be sure to remove the comments

     The following sample allows you to download and install the 64 bit version of the Office 365 ProPlus apps
     and Visio Pro for Office 365 directly from the Office CDN using the Current Channel
     settings  -->

<Configuration>
  <Add SourcePath="D:\Other apps\ODT" OfficeClientEdition="64" Channel="Current">
    <Product ID="O365ProPlusRetail">
      <Language ID="en-gb" />
      <ExcludeApp ID="Groove" />
      <ExcludeApp ID="Lync" />
      <ExcludeApp ID="OneDrive" />
      <ExcludeApp ID="Teams" />
    </Product>
  </Add>
  <Updates Enabled="TRUE" Channel="Current" />
</Configuration>
```

You can change the `SourcePath` to what you want but it must be a path to a folder in the same volume as `setup.exe`.

In my case, I have excluded Groove, Lync, OneDrive and Teams from being installed because I find them bloat. I've also specified the British English locale. You can change it to something like `en-us` if you prefer.

Once the configuration is done, run the following command to download the deployment files.

```
.\setup.exe /download config.xml
```

Microsoft likes to use `/` to denote an argument as opposed to `-` and `--` which are favoured by Linux. And also instead of `./setup.exe`, you have to run `.\setup.exe` instead.

If you poke around in the `SourcePath` directory, you'll find a bunch of `.cab` files. Those are the deployment files. Presumably it's so IT administrators only have to download it once from Microsoft's CDN and then they can install to all the devices on the network locally.

To install the files, run the following command.

```
.\setup.exe /configure config.xml
```

A bit unexpected that the option is called `configure` but it gets the job done well enough. Both these operations will take a while.

Now, Microsoft Office should be installed. See [https://github.com/massgravel/Microsoft-Activation-Scripts](https://github.com/massgravel/Microsoft-Activation-Scripts) if you don't want to pay for a license. However, only the 180 day option works.
