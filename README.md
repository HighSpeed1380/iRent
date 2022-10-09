# iRent Main Application

## compile

### [install nvm environment](https://tecadmin.net/install-nvm-macos-with-homebrew/)

1. Prerequisites

You must have macOS desktop access with administrator privileges.
Login to the macOS desktop system and install Homebrew on your system (if not already installed)

```
$ ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

2. Remove existing Node Versions

```
$ brew uninstall --ignore-dependencies node 
$ brew uninstall --force node 
```

3. Install NVM on macOS

```
$ brew update 
$ brew install nvm 
```

Next, create a directory for NVM in home.

```
$ mkdir ~/.nvm 
```

Now, configure the required environment variables. Edit the following configuration file in your home directory

```
$ vim ~/.bash_profile 
```

and, add below lines to ~/.bash_profile ( or ~/.zshrc for macOS Catalina or later)

export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

Press ESC + :wq to save and close your file.

Next, load the variable to the current shell environment. From the next login, it will automatically loaded.

```
$ source ~/.bash_profile
```

4. Install Node.js with NVM

First of all, see what Node versions are available to install. To see available versions, type:

```
$ nvm ls-remote 
```

Now, you can install any version listed in above output. You can also use aliases names like node for latest version, lts for latest LTS version, etc.

```
$ nvm install node     ## Installing Latest version 
$ nvm install 14       ## Installing Node.js 14.X version 
```

After installing you can verify what is installed with:

```
$ nvm ls
```

If you have installed multiple versions on your system, you can set any version as the default version any time. To set the node 14.X as default version, simply use:

```
$ nvm use 14
```

### compile project

1. Make a project dir

```
$ mkdir ~/work
$ cd ~/work
```

2. Download project from github.

```
$ git clone https://github.com/wkelty/iRent-Main-App.git
```

3. Install packages

```
$ cd iRent-Main-App
$ npm install
```

4. Run the application in local environment

```
$ npm start
```

## deploy

1. Compile project for production

```
$ cd ~/work/iRent-Main-App
$ npm run build
```

2. Copy the build directory to the document root of web server

3. Restart the web server
