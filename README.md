# CommandExecutor

This program is a Node.js application that watches for commands in a file (commands.txt) and executes them based on specific instructions. It leverages the Node.js `file system` module for file operations and the `EventEmitter` for real-time updates when commands.txt changes. User can execute the following commands:-

- Creating a file.
- Deleting a file.
- Renaming a file.
- Adding content to a file.<br>

The FileFactory class handles each command, and the app reads commands.txt using a buffer, interprets the command, and executes it. This makes it a simple, dynamic system for automated file management based on user input in real time.

**RUN the App**
`node app.js`
