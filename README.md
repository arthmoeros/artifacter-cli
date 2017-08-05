# ![artifacter-logo](https://raw.githubusercontent.com/arthmoeros/artifacter-ui/master/src/assets/img/rsz_artifacter-logo.png)@artifacter/cli

### Command Line Interface for Artifacter

#### What's this? - Intro
This a Command Line Interface utility that connects to a running Artifacter Web API and provides artifact generation through a CLI. It follows a similar workflow as @artifacter/ui

#### How do I use this? - Install and options
A global install via npm is suggested, like this:

```bash
npm install -g @artifacter/cli
```

It requires setting the ***ARTIFACTER_API*** environment variable, which must contain the base url where Artifacter's Web API is hosted, by default it goes to http://localhost:8080.

```bash
export ARTIFACTER_API=http://yourownapi:8888
```

##### Interactive run
If you run the **artifacter** command without parameters, it will run in Full Interactive mode, where it will ask for every input required to achieve an artifact generation

```console
Artifacter Command Line Interface (full interactive)
version 1.0.0

ARTIFACTER_API env variable is not set!, using the default configuration
Using Artifacter API at 'http://localhost:8080'
```

##### Form preset + Interactive run
If you use the *--form* switch, which specifies both the Form Configuration and Form Index to use, it will start asking only for the input of the preset form, the format is *[form-configuration],[form-index]*

```bash
artifacter --form 1,1
```

##### JSON input
With the *--json* switch, you can specify a json file to use directly as a request to the Artifacter Web API, without any interactive input.

```bash
artifacter --json inputRequest.json
```

Both the Interactive run and Form preset methods, generate a backup JSON file containing all the input values given in each interactive run.
