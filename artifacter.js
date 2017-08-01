#!/usr/bin/env node
require('./src/main.process').run().catch((error) => { throw new Error(error); });