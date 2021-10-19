## Install

First, clone the repo via git and install dependencies:

```bash
git clone https://github.com/nikolaytoplev/csv-stream-read.git
cd csv-stream-read
npm install
```

## Set CLI for Global use

In the root directory of the project set install command as global

```bash
npm install -g
```

After that you can use your command globally

## Run CLI

To get result from CSV run below cmd in the directory where the csv file exist:

```bash
transaction -n <filename>
```

## Docs

Time consuming issue is very important for handling large files so the code determines condition at first and then start to read file.

File is extreme large so it must be read as stream.

API_URL and TOKEN is set on bin/index.js since .env is not available for global use.
