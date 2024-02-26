# AWSM
This is the second Version of the *AwesomeWaveSplineMachine*. It is a quite unique modular software synthesizer that utilizes dynamic *WaveSpline* synthesis.

Click the link below to try the AWSM in your browser. 

🚀 [AWSM - AwesomeWaveSplineMachine MKII](https://rnd7.github.io/awsm-mkii/dist/index.html)

For more information consider one of the following links.

📚 [User Guide](#user-guide)

🏗 [Developer Guide](#developer-guide) 

🏛 [License](#license) 

# User guide

[Back to top](#awsm)

This is an early beta version. It is likely that the data structure will change. A migration of existing user data is not planned. It should therefore be expected that existing songs will sound different or be lost at a later date.

Click on top left button to toggle between database and performance mode. Several sessions can be managed and loaded in the Database view. Within Performance mode, the parameters of the currently selected session can be adjusted.

Within Performance Mode, the views are managed in the left-hand column. Every view adds a column. You can add as many views as you like and navigate within these individually. The selected element in the Session tree is highlighted using a white background. A tap on a selected element toggles the Navigation visibility.

The main mix controls and some global settings are located in the Session section.

A Session can contain multiple Channels with multiple individual Voices. Every Voice can be modulated by various different Oscillators.

Double tap to add or remove additional WaveSplinePoints to a WaveSplineGraph.

Some user interface elements cycle through different modes on tap, these can be indentified by a hint in the bottom right-hand corner of an element.
 
# Developer guide

[Back to top](#awsm)


```bash
npm install
```

```bash
npm run build
```

```bash
npm run serve
```


# License

[Back to top](#awsm)

Feel free to use this tool to make music or to test the limits of your speakers. I encourage this. When redistributing the software, be sure to understand the underlying license. Since I'm donating a considerable amount of my time to the opensource community, it's important to me that everything that builds on this is also available to everyone.

This project is licensed under the GNU General Public License v3.0

Copyright (C) 2024  C. Nicholas Schreiber

See [COPYING](https://rnd7.github.io/awsm-mkii/COPYING) for the license text or contact me for more information.

The license applies to every file within this repository even if not explicitly stated within the source code of every module.

Official GNU license page: [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html)
