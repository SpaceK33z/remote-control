## Usage

Run `npm install`, then to run the server: `./server.js`.

Add the commands you would like to run / see in `commands.json`. Each command requires a `name` and `exec` property. Optional are:

- `icon` - specify an icon for the command here.
- `confirm` (boolean) - Show a confirmation prompt before executing the command.
- `dir` - working directory of command.

## ToDo

- Nice interface.
- Authentication.
- Allow some configuration options from cli.
