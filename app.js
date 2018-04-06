// Dependencies
const fs = require("fs");
const cmd = require("node-cmd");
const walkSync = require("walk-sync");
const probe = require("node-ffprobe");
const math = require("mathjs");

// Config
const screenshotsNumber = 5;
let videosDirectory = __dirname + "\\video\\";
const fileType = "*.mp4";

// Main function
function getScreenshots() {

    // Get all directories
    fs.readdirSync(videosDirectory).forEach(path => {

        let files = walkSync(videosDirectory + path, { directories: false, globs: [fileType] });

        // Loop through directories and files
        for (let i = 0, filesLenght = files.length; i < filesLenght; i++) {
            
            // Declare the screenshots's folder
            let screenshotsDirectory = videosDirectory + "\\" + path + "\\" + files[i] + "_SCREENSHOTS";

            // Get video info
            probe(videosDirectory + path + "\\" + files[i], function(err, probeData) {
                
                // Start the video at 1/3 and stop 5 seconds before
                let videoStart = math.round(probeData.format.duration / 3);
                let limitDuration = math.round(probeData.format.duration - videoStart - 5);
                
                // In case the video is too short, start after 4 seconds
                if (limitDuration - videoStart < 15) {
                    videoStart = 4;
                }

                // Create the screenshots's folder
                if (!fs.existsSync(screenshotsDirectory)) {
                    fs.mkdirSync(screenshotsDirectory);
                }
    
                // Declare the command
                let command = "ffmpeg -ss " + videoStart + " -t " + limitDuration + " -i \"" + videosDirectory + path + "\\" + files[i] + "\" -vf \"select=gt(scene\\,0.4)\" -frames:v " + screenshotsNumber + " -vsync vfr \"" + screenshotsDirectory + "\\" + files[i] + "-%02d.jpg\"";

                // Execute the command
                cmd.get(
                    command,
                    function (err, data, stderr) {
                        if (err) {
                            return err;
                        }
                    }
                );

                // Debug
                console.log(command);

            }); 
        }
    });

}

// Start the function
getScreenshots();