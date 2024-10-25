[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m797890225-f0d7c351f78a2c7bd6bae078?up_message=Online&up_color=green&down_message=Offline&down_color=red&style=flat&label=Uptime&cacheSeconds=3600)](https://status.myip.fail/)

# myip.fail

I needed an excuse to tinker with Cloudflare Workers, and for whatever reason this was it.

So there you have it, yet *another* "What is my IP" site.

:white_check_mark: instant access with `curl`

:white_check_mark: Copy to clipboard

:white_check_mark: Provider info

:white_check_mark: Location info

:white_check_mark: Device info

## Usage

**Browser**:

Simply head over to [myip.fail](https://myip.fail) to see your IP, click or tap anywhere on the card to copy the IP to clipboard.

**Terminal**:

Using [myip.fail](https://myip.fail) from a terminal is easy:

```
curl myip.fail
```

Options to copy to clipboard from terminal may vary based on your system. Here are some examples to get you started:

In MacOS, open a terminal and do:

```
curl myip.fail | pbcopy
```

In Linux:

Many ways available but I like `xclip`. Make sure that is installed, then:

```
curl myip.fail | xclip -selection clipboard
```

Windows:

Open PowerShell and do:

```
curl myip.fail | Set-Clipboard
```

![Screenshot](./curl.png)

![Screenshot](./darkmode.png)

![Screenshot](./lightmode.png)

![Screenshot](./mobile.jpeg)
