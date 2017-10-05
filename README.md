# ![qsdt-logo](https://raw.githubusercontent.com/arthmoeros/qsdt-ui/master/src/assets/img/rsz_qsdt-logo.png)@qsdt/cli

### Command Line Interface for qsdt

#### What's this? - Intro
This a Command Line Interface utility that connects to a running qsdt Web API and provides artifact generation through a CLI. It follows a similar workflow as @qsdt/ui

#### How do I use this? - Install and options
A global install via npm is suggested, like this:

```bash
npm install -g @qsdt/cli
```

It requires setting the ***QSDT_API*** environment variable, which must contain the base url where qsdt's Web API is hosted, by default it goes to http://localhost:8080.

```bash
export QSDT_API=http://yourownapi:8888
```

##### Interactive run
If you run the **qsdt** command without parameters, it will run in Full Interactive mode, where it will ask for every input required to achieve an artifact generation

```console
qsdt Command Line Interface (full interactive)
version 1.0.0

QSDT_API env variable is not set!, using the default configuration
Using qsdt API at 'http://localhost:8080'
```

##### Form preset + Interactive run
If you use the *--form* switch, which specifies both the Form Configuration and Form Index to use, it will start asking only for the input of the preset form, the format is *[form-configuration],[form-index]*

```bash
qsdt --form 1,1
```

##### JSON input
With the *--json* switch, you can specify a json file to use directly as a request to the qsdt Web API, without any interactive input.

```bash
qsdt --json inputRequest.json
```

Both the Interactive run and Form preset methods, generate a backup JSON file containing all the input values given in each interactive run.
