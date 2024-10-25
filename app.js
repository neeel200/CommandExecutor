const { watch, open, stat, unlink, rename } = require("fs/promises");
const { Buffer } = require("buffer");

/* Prefix commands */

const CREATE_FILE = "create file";
const DELETE_FILE = "delete file";
const RENAME_FILE = "rename file";
const ADD_TO_FILE = "add to file";

/* File factory for creating, deleting, renaming and writing into the given file(s) stated in the command  */
class FileFactory {
    constructor() {
        // No initializaiton needed for now
    }
    async createFile(path) {
        try {
            const existingFileHandle = await open(path, "r"); // r for read mode
            await existingFileHandle.close();
            console.log(`File ${path} already exists!`);
        } catch (error) {
            // throws error if file not found then create a new file
            const newFileHandle = await open(path, "w"); // create api
            await newFileHandle.close();
            console.log("File created successfully !");

        }
    }
    async deleteFile(path) {
        try {
            await unlink(path); // delete api
            console.log(`File ${path} deleted successfully!`);
        } catch (error) {

            // ENOENT - Error No Entry:- No file found
            if (error.code === "ENOENT") {
                console.log(
                    "No file at this path to rename, or the destination doesn't exist."
                );
            } else {
                console.log("An error occurred while removing the file: ");
                console.log(error);
            }

        }
    }
    async renameFile(oldPath, newPath) {
        try {
            await rename(oldPath, newPath); // rename api
            console.log(`File ${oldPath} successfully renamed to ${newPath} !`)
        } catch (error) {

            if (error.code === "ENOENT") {
                console.log(
                    "No file at this path to rename, or the destination doesn't exist."
                );
            } else {
                console.log("An error occurred while removing the file: ");
                console.log(error);
            }

        }
    }
    async writeFile(path, content) {
        try {
            const existingFileHandle = await open(path, "a"); // open file for appending
            await existingFileHandle.write(content); // write
            await existingFileHandle.close(); // close the previously opened file
            console.log(`File ${path} write done!`);
            existingFileHandle.close();
        } catch (error) {

            console.log("Error occured while writing", error);

        }
    }

}

const init = async () => {
    try {
         /* Watch commands.txt file */
         const watcher = watch("./commands.txt");

         /* if any changes found within the file then loop over the changes and execute the command */
         for await (const event of watcher) {
             if (event.eventType === "change") {
 
                 // call the command handler for every change
                 commandFileHandler.emit("change")
             }
         }

        /* Initialize the file factory */
        const fileFactory = new FileFactory();

        /* Open a file in read mode so as track change */
        const commandFileHandler = await open("./commands.txt", "r")

        /* Now whenever "change" event occurs then allocate the bytes to a new memory buffer
         then so what command has been typed in the file and execute the same command. */

        commandFileHandler.on("change", async () => {

            /* Allocating the buffer */

            // total length of the file (in bytes)
            const size = (await stat("./commands.txt")).size

            // allocating buffer in the memory
            const buff = Buffer.alloc(size);

            // Number of bytes to read from the source (byteLen - offset)
            const length = buff.byteLength;

            // From where to fill the allocaed buffer
            const offset = 0;

            // From where to read form the file
            const position = 0;

            // FInally read the contents from command file and put them into a buffer 
            await commandFileHandler.read(buff, offset, length, position);

            // typed command 
            const command = buff.toString("utf-8");

            /* Check which command has been typed and do execute that command */

            // create a file
            // create file <filePath>
            if (command.includes(CREATE_FILE)) {
                const path = command.substring(CREATE_FILE.length + 1);
                const trimmedPath = path.trim();
                fileFactory.createFile(trimmedPath)
            }

            // delete a file
            // delete file <filePath>
            if (command.includes(DELETE_FILE)) {
                const path = command.substring(DELETE_FILE.length + 1);
                const trimmedPath = path.trim();
                fileFactory.deleteFile(trimmedPath)
            }

            // rename a file
            // rename file <oldFilePath> to <newFilePath>
            if (command.includes(RENAME_FILE)) {
                const pathsSeparaterIdx = command.indexOf(" to ");
                const oldPath = command.substring(RENAME_FILE.length + 1, pathsSeparaterIdx).trim();
                const newPath = command.substring(pathsSeparaterIdx + 4).trim();
                fileFactory.renameFile(oldPath, newPath);
            }

            // write to a file (or append to a file )
            // add to file <filePath> content: <content>
            if (command.includes(ADD_TO_FILE)) {
                const contentSeparaterIdx = command.indexOf(" content: ");
                
                const path = command.substring(ADD_TO_FILE.length + 1, contentSeparaterIdx).trim();
                const content = command.substring(contentSeparaterIdx + 10).trim();
                fileFactory.writeFile(path, content)
            }

        })

    } catch (err) {
        console.log(err)
    }

}

/* Initialization */
init();
