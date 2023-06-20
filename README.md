# First run

When first cloning this repository, first run the following command:

```shell
npm install
```

To run tests, execute:
```shell
npm test
```

To run specific tests, execute:

```shell
npm test -- --grep 'Group or test name'
```

### Inclusion of `dotenv`
This project uses `.env` to store sensitive and platform specific information.
In order to properly run a project, you should create a `.env` file in your
project root directory, and populate it with proper data.

This is the example `.env` file:
```dotenv
# System setup
USE_BROWSER="firefox"
# Login data
LOGIN_USERNAME="FILL_IN_YOUR_USERNAME"
LOGIN_PASSWORD="FILL_IN_YOUR_PASSWORD"
```

Depending on your OS, you can choose which browser to run
by changing `USE_BROWSER` option in `.env`. Some of the
valid options are:
`chrome`, `firefox`, `MicrosoftEdge`, `safari`, etc.