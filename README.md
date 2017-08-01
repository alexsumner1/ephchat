# Ephchat - In-memory Ephemeral Chat Client based on Ruby on Rails

This is a simple implementation of a cloud-based chat client for talking privately with one or more people, written in Sinatra with an AngularJS frontend.

## Features
- Client-side encryption using cryptoJS, no plaintext messages apart from usernames and timestamps ever reach the server
- The server stores messages in-memory in a simple Ruby hash, nothing ever touches disk
- Message retention is set via the number of messages to be stored in the array at any one time, further messages will unshift the oldest from the array
- Usernames and keys can be changed at any time, on demand, for ultimate anonymity and security
- Global delete-for-everyone button, to wipe an entire conversation from all people's screens
- All settings are used by every client, so there's no least-secure person in a conversation

## Pre-requisites
- `ruby`
- `rubygems`

## Setup
To get it all working, you just need to do a `bundle install` in the project folder to install all required dependencies, then simply run `ruby main.rb` in the project folder, this will start a server bound to port 8081 on localhost, so you can test it. Then you could run an nginx web proxy if you want to host it.

## Desirable features
- Image sharing
- Potential calling features
- Individual message deletion or 'starring' messages
