#!/usr/bin/env node

import chokidar from "chokidar"
import fs from 'fs-extra'
import webpack from 'webpack'
import path from 'path'

function bundleWorklet() {
    return new Promise((resolve, reject)=>{
        webpack({
            entry: {
                "wave-spline-processor": './src/audio/wave-spline-processor.js',
            },
            output: {
                path: path.resolve('./', 'dist/audio/'),
                filename: '[name].js'
            },
            optimization: {
                minimize: false
            }
        }, (err, stats) => {
            if (err || stats.hasErrors()) {
                console.log(stats)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

async function build() {
    console.log("Build AWSM")
    try {
        console.info("Remove dir")
        await fs.remove('./dist')
        console.info("Copy files")
        await fs.copy('./src', './dist')
        console.info("Bundle Worklet")
        await bundleWorklet()
        console.info("Done")
    } catch(e) {
        console.error(e)
    }
}


chokidar.watch([
        './src',
        '../shared/model/src'
    ]).on('all', (event, path) => {
    triggerBuild()
    //
});


let buildTriggered = false
let changedWhileBuild = false
let timeout
function triggerBuild() {
    if (buildTriggered) {
        if (!timeout) changedWhileBuild = true
        return
    } 
    console.log("trigger build")
    buildTriggered = true
    changedWhileBuild = false
    timeout = setTimeout(async ()=>{
        timeout = null
        await build()
        console.log("build complete")
        buildTriggered = false
        if (changedWhileBuild) {
            console.log("retrigger")
            triggerBuild()
        }
    },1000)
    
}
triggerBuild()