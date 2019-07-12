# Keyboard key press locker

An extension to prevent the key presses as specified in the config.

## Installation

Download the ZIP and extract into the src > extensions directory and run an appropriate Grunt task.

## Usage

Add to the `config.json` extension config entry:

```
    "_keyBlocker": {
        "_isEnabled": true,
        "keys": [9, 13, 32]
    }
```

* keys - an array of key codes to block

## Notes

When accessibility is required then this extension can make it work erraticly e.g. when TAB key blocked
This may also prevent from working some of the input components.

## Tested on
Opera 37.0, Chrome 50, FF 45.0.2, IE 11