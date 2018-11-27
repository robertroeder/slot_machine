# Yelp Slot Machine
This is a modern proof of concept Yelp slot machine game, built using only vanilla HTML, CSS and JavaScript.
No Flash or Frameworks required. Allowing for an amazing low bundle size and blazing fast performance.

Built using the *Web Animations API*.

**[Live Demo](https://people.yelpcorp.com/~rroeder/yelp_slot/)**

## Features
* Fully responsive for great UX on mobile, web & fullscreen mode.
* Autoplay functionality, which keeps running even if the game window is in background.


## Installation, Build & Deployment
1) Clone repository
2) Run `npm install`
    - *Development*: run `npm start` and go to `http://localhost:8080`
    - *Production*: run `npm run-script build` and serve from `/dist`

## Controls
Currently, the game is entirely keyboard-controlled. The basic controls are:

| Action | Key Control |
| ------------- | ------------ |
| Increase bet by 50 (Up to max of 250) | `=` or `+` |
| Decrease bet by 50 (Down to min of 50) | `-` or `_`|
| Spin the slot machine | `spacebar` |

## Configuration
For configuration options see `config` object in index.js

| Property | Description | Default |
| ------------- | ------------- | ------------- |
| `inverted`  | Controls visual spinning direction of reels. If false, reels will spin from bottom to top. If true, reels will spin from top to bottom | false |

## Credits
Basic slot machine and reel animation code taken from [this GitHub repo](https://github.com/johakr/html5-slot-machine)
