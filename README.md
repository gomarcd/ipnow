[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797890225-f0d7c351f78a2c7bd6bae078?up_message=Online&up_color=green&down_message=Offline&down_color=red&style=flat&label=Uptime&cacheSeconds=3600)](https://status.ip.now/)

# ip.now

I needed an excuse to tinker with Cloudflare Workers, and for whatever reason this was it.

So there you have it, yet *another* "What is my IP" site.

:white_check_mark: Instant access with `curl ip.now`

:white_check_mark: Copy to clipboard

:white_check_mark: Provider info

:white_check_mark: Location info

:white_check_mark: Device info

:white_check_mark: Auto light/dark mode per system settings

:white_check_mark: Webapp works seemlessly on all devices

## Usage

**Browser**:

Simply head over to [ip.now](https://ip.now) to see your IP, click or tap the IP address to copy to clipboard.

**Terminal**:

Using [ip.now](https://ip.now) from a terminal is easy:

```
curl ip.now
```

Options to copy to clipboard from terminal may vary based on your system. Here are some examples to get you started:

In MacOS, open a terminal and do:

```
curl ip.now | pbcopy
```

In Linux:

Many ways available but I like `xclip`. Make sure that is installed, then:

```
curl ip.now | xclip -selection clipboard
```

Windows:

Open PowerShell and do:

```
curl ip.now | Set-Clipboard
```
With that, you instantly have your public IP address copied to clipboard.

## Screenshots

<div align="center">
	<img src="./curl.png" alt="Curl Screenshot" width="700">
</div>

<div align="center">
	<img src="./lightmode.png" alt="Light Mode Screenshot" width="300">
	<img src="./darkmode.png" alt="Dark Mode Screenshot" width="300">  
</div>

# Support

Follow me on Twitter, support me right here on GitHub or Buy Me a Coffee! Any and all support is deeply appreciated:

<div align="center">
	<a href="https://twitter.com/gomarcd"><img src="https://img.shields.io/twitter/follow/gomarcd?style=social" alt="Follow me on Twitter" width="150"></a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/sponsors/gomarcd">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor me on GitHub" width="150">
  </a>&nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://www.buymeacoffee.com/gomarcd">
    <img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee" width="150">
  </a>
</div>
