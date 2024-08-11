# VSCode Expo Metro Keep-Alive (Win)
This Visual Studio Code extension is intended for those who, like me,  are annoyed about having to reload their Expo project because Metro keeps disconnecting from Expo Go on their physical device every 5 seconds.

Now you can have a status bar item (button) that starts and stops your Expo project **in tunnel mode**, so that you can continue developing your super React Native project in your physical device, over mobile data, without having Metro disconnect with such frequency.

## Features

- Automatically detects your Expo project and places a Start/Stop button in VS Code's status bar.
- When pressing start, it runs your project in tunnel mode and keeps the Metro server running in the background, even when you haven't performed any action(s) on your project for a while.
- Automatically stops Metro when it detects a problem while starting up, or a failure in the process.

## Installation

1. Open Visual Studio Code.
2. Press `Ctrl+Shift+X` to open the **Extensions** view.
3. Search for "Expo Metro Keep-Alive (Win)" and click the "Install" button.
4. Restart Visual Studio Code to activate the extension.

## Usage

1. Open an Expo project in Visual Studio Code.
2. Use the `Start Metro (keep alive)` status bar button, or the `Expo tunnel: Start` and `Expo tunnel: Stop` command palette options to start or stop the project.

<div align="left">
<h3 style="font-style: italic;">Button's location</h3>
<img src="https://res.cloudinary.com/dlr88vvxh/image/upload/v1723341786/vscext/expo-metro-keepalive/readme-start_pd0953.png" height="500" />
</div>

<div align="left">
<h3 style="font-style: italic;">Command Palette</h3>
<img src="https://res.cloudinary.com/dlr88vvxh/image/upload/v1723341785/vscext/expo-metro-keepalive/readme-cmd-palt_dqdx1e.png" width="700">
</div>


## Known Issues and Caveats

1. **This is an extension intended for Windows PC versions of Visual Studio Code**. It hasn't been tested on any other platform apart from **Windows 10 Pro**--use at your own risk.
2. The button will only be added to the status bar if the project is an Expo project. However, the corresponding commands accessed via `Ctrl+Shift+P` will still be available for use. On non-Expo projects, a warning message will be displayed for your convenience, but I still haven't found a workaround for preventing those to be included in such scenarios.
2. On several ocassions during tryouts, stopping the project and re-starting it has ended up in failure due to `ngrok` failing for some reason. At the time of this writing, I still haven't found the reason for this. Fortunately, it is something that doesn't happen quite often on my end, buy you've been informed 🤷‍♂️
3. The extension will detect a failure in the underlying script when it happens, and will automatically call the stop procedure. However, it will also clean up resources in the process, so the terminal will close. This is expected behavior. I'm planning on updating this behavior on future releases.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Release Notes

This is the initial release of this extension, and my very first VS Code extension--feeling proud 🥳!
> _"Is this how things look inside the temple??..."_ 😮👍😏

### 1.0.0

Initial release and house warming party!

---

# Cheers!
